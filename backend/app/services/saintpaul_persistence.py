"""Persistence service for the Saint Paul student workflow."""

from __future__ import annotations

import base64
import mimetypes
import re
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any
from urllib.parse import unquote, urlparse
from uuid import uuid4

import boto3
from boto3.dynamodb.conditions import Attr, Key

from app.core.config import Settings
from app.schemas.saintpaul import (
    SaintPaulErrorRecord,
    SaintPaulEventRequest,
    SaintPaulQuizAttemptRequest,
    SaintPaulSessionSnapshotRequest,
    SaintPaulSessionStartRequest,
)


class SaintPaulPersistenceError(RuntimeError):
    """Raised when Saint Paul persistence operations fail."""


@dataclass
class SaintPaulAssetUploadResult:
    """Metadata for an uploaded Saint Paul asset."""

    bucket: str
    key: str
    url: str
    content_type: str
    size_bytes: int


class SaintPaulPersistenceService:
    """Persist Saint Paul session state, events, errors, and assets."""

    def __init__(self, settings: Settings) -> None:
        session_kwargs: dict[str, str] = {}
        if settings.aws_region_name:
            session_kwargs["region_name"] = settings.aws_region_name
        if settings.aws_profile:
            session_kwargs["profile_name"] = settings.aws_profile
        elif settings.aws_access_key_id and settings.aws_secret_access_key:
            session_kwargs["aws_access_key_id"] = settings.aws_access_key_id
            session_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

        self._region = settings.aws_region_name
        self._sessions_table_name = settings.aws_saintpaul_sessions_table
        self._events_table_name = settings.aws_saintpaul_events_table
        self._errors_table_name = settings.aws_saintpaul_errors_table
        self._assets_bucket = settings.aws_saintpaul_assets_bucket
        self._enabled = bool(
            self._sessions_table_name and self._events_table_name and self._errors_table_name
        )
        self._assets_enabled = bool(self._assets_bucket)

        session = boto3.session.Session(**session_kwargs)
        self._dynamodb = session.resource("dynamodb")
        self._s3_client = session.client("s3")

        self._sessions_table = (
            self._dynamodb.Table(self._sessions_table_name)
            if self._sessions_table_name
            else None
        )
        self._events_table = (
            self._dynamodb.Table(self._events_table_name)
            if self._events_table_name
            else None
        )
        self._errors_table = (
            self._dynamodb.Table(self._errors_table_name)
            if self._errors_table_name
            else None
        )
        self._research_overview_cache: dict[tuple[int | None], dict[str, Any]] = {}
        self._research_overview_cache_lock = RLock()

    @property
    def enabled(self) -> bool:
        return self._enabled

    @property
    def assets_enabled(self) -> bool:
        return self._assets_enabled

    def create_session(self, payload: SaintPaulSessionStartRequest) -> tuple[str, datetime]:
        """Create a new session metadata item and return its id."""

        session_id = uuid4().hex
        started_at = datetime.now(timezone.utc)

        if not self._enabled:
            return session_id, started_at

        item = {
            "session_id": session_id,
            "item_key": "SESSION#META",
            "item_type": "session_meta",
            "student_id": payload.student_id,
            "subject": payload.subject,
            "version": payload.version,
            "grade": payload.grade,
            "mode": payload.mode,
            "topic": payload.topic,
            "objectives": payload.objectives,
            "started_at": started_at.isoformat(),
            "last_seen_at": started_at.isoformat(),
            "current_tab": "pre",
            "active_objective_index": 0,
            "objective_statuses": ["not-started" for _ in payload.objectives],
            "pre_quiz_submitted": False,
            "post_quiz_submitted": False,
            "lesson_instruction_acknowledged": False,
        }
        self._put_item(self._sessions_table, item)
        if payload.objectives:
            self.persist_chat_message(
                session_id=session_id,
                student_id=payload.student_id,
                objective_index=0,
                role="assistant",
                content=(
                    f"我們先聚焦這個學習目標：「{payload.objectives[0]}」。"
                    "你可以先告訴我哪一部分最不確定，我會一步一步陪你整理。"
                ),
                created_at=started_at,
                message_key="0000-INTRO-0",
            )
        return session_id, started_at

    def save_snapshot(self, payload: SaintPaulSessionSnapshotRequest) -> datetime:
        """Persist the latest session snapshot and assessments if submitted."""

        saved_at = datetime.now(timezone.utc)
        if not self._enabled:
            return saved_at

        existing_meta = self._get_item(
            self._sessions_table,
            key={"session_id": payload.session_id, "item_key": "SESSION#META"},
        )
        meta_item = {
            "session_id": payload.session_id,
            "item_key": "SESSION#META",
            "item_type": "session_meta",
            "student_id": payload.student_id,
            "subject": payload.subject,
            "version": payload.version,
            "grade": payload.grade,
            "mode": payload.mode,
            "topic": payload.topic,
            "objectives": payload.objectives,
            "current_tab": payload.current_tab,
            "active_objective_index": payload.active_objective_index,
            "objective_statuses": payload.objective_statuses,
            "lesson_instruction_acknowledged": payload.lesson_instruction_acknowledged,
            "pre_quiz_submitted": payload.pre_quiz_submitted,
            "post_quiz_submitted": payload.post_quiz_submitted,
            "pre_quiz_responses": payload.pre_quiz_responses,
            "post_quiz_responses": payload.post_quiz_responses,
            "completed_at": payload.completed_at.isoformat()
            if payload.completed_at
            else None,
            "last_seen_at": saved_at.isoformat(),
            "started_at": existing_meta.get("started_at") if existing_meta else None,
        }
        self._put_item(self._sessions_table, meta_item)

        if payload.pre_quiz_submitted:
            existing_pre = self._get_item(
                self._sessions_table,
                key={"session_id": payload.session_id, "item_key": "ASSESSMENT#PRE"},
            )
            self._put_item(
                self._sessions_table,
                {
                    "session_id": payload.session_id,
                    "item_key": "ASSESSMENT#PRE",
                    "item_type": "assessment",
                    "student_id": payload.student_id,
                    "assessment_type": "pre",
                    "responses": payload.pre_quiz_responses,
                    "submitted_at": (
                        existing_pre.get("submitted_at") if existing_pre else saved_at.isoformat()
                    ),
                },
            )

        if payload.post_quiz_submitted:
            existing_post = self._get_item(
                self._sessions_table,
                key={"session_id": payload.session_id, "item_key": "ASSESSMENT#POST"},
            )
            self._put_item(
                self._sessions_table,
                {
                    "session_id": payload.session_id,
                    "item_key": "ASSESSMENT#POST",
                    "item_type": "assessment",
                    "student_id": payload.student_id,
                    "assessment_type": "post",
                    "responses": payload.post_quiz_responses,
                    "submitted_at": (
                        existing_post.get("submitted_at")
                        if existing_post
                        else saved_at.isoformat()
                    ),
                },
            )

        return saved_at

    def append_event(self, payload: SaintPaulEventRequest) -> tuple[str, datetime]:
        """Append a Saint Paul event to the event log."""

        event_id = uuid4().hex
        recorded_at = datetime.now(timezone.utc)
        if not self._enabled:
            return event_id, recorded_at

        item = {
            "session_id": payload.session_id,
            "item_key": f"EVENT#{recorded_at.isoformat()}#{event_id}",
            "event_id": event_id,
            "student_id": payload.student_id,
            "event_type": payload.event_type,
            "tab": payload.tab,
            "objective_index": payload.objective_index,
            "client_timestamp": payload.client_timestamp.isoformat()
            if payload.client_timestamp
            else None,
            "recorded_at": recorded_at.isoformat(),
            "payload": payload.payload,
        }
        self._put_item(self._events_table, item)
        return event_id, recorded_at

    def persist_chat_message(
        self,
        *,
        session_id: str,
        student_id: str | None,
        objective_index: int | None,
        role: str,
        content: str,
        model: str | None = None,
        created_at: datetime | None = None,
        message_key: str | None = None,
    ) -> datetime:
        """Store one chat message as a first-class session item."""

        recorded_at = created_at or datetime.now(timezone.utc)
        if not self._enabled:
            return recorded_at

        message_id = message_key or uuid4().hex
        item_key = (
            f"MESSAGE#{objective_index if objective_index is not None else 'NA'}#{message_key}"
            if message_key
            else (
                f"MESSAGE#{objective_index if objective_index is not None else 'NA'}"
                f"#{recorded_at.isoformat()}#{message_id}"
            )
        )
        item = {
            "session_id": session_id,
            "item_key": item_key,
            "item_type": "message",
            "student_id": student_id,
            "objective_index": objective_index,
            "message_id": message_id,
            "role": role,
            "content": content,
            "model": model,
            "created_at": recorded_at.isoformat(),
        }
        self._put_item(self._sessions_table, item)
        return recorded_at

    def persist_quiz_attempt(self, payload: SaintPaulQuizAttemptRequest) -> datetime:
        """Store a completed AI quiz attempt snapshot."""

        recorded_at = payload.submitted_at or datetime.now(timezone.utc)
        if not self._enabled:
            return recorded_at

        item = {
            "session_id": payload.session_id,
            "item_key": (
                f"ARTIFACT#QUIZ_ATTEMPT#{payload.objective_index}"
                f"#{recorded_at.isoformat()}#{payload.quiz_id}"
            ),
            "item_type": "artifact_quiz_attempt",
            "student_id": payload.student_id,
            "objective_index": payload.objective_index,
            "quiz_id": payload.quiz_id,
            "title": payload.title,
            "score": payload.score,
            "total_questions": payload.total_questions,
            "error": payload.error,
            "questions": [question.model_dump(mode="json") for question in payload.questions],
            "submitted_at": recorded_at.isoformat(),
        }
        self._put_item(self._sessions_table, item)
        return recorded_at

    def record_error(self, payload: SaintPaulErrorRecord) -> tuple[str, datetime]:
        """Persist a Saint Paul error record."""

        error_id = uuid4().hex
        recorded_at = datetime.now(timezone.utc)
        if not self._enabled:
            return error_id, recorded_at

        item = {
            "session_id": payload.session_id,
            "item_key": f"ERROR#{recorded_at.isoformat()}#{error_id}",
            "error_id": error_id,
            "student_id": payload.student_id,
            "stage": payload.stage,
            "error_scope": payload.error_scope,
            "error_code": payload.error_code,
            "error_message": payload.error_message,
            "raw_error": payload.raw_error,
            "tab": payload.tab,
            "objective_index": payload.objective_index,
            "request_id": payload.request_id,
            "metadata": payload.metadata,
            "recorded_at": recorded_at.isoformat(),
        }
        self._put_item(self._errors_table, item)
        return error_id, recorded_at

    def get_research_overview(
        self, *, limit: int | None = None, force_refresh: bool = False
    ) -> dict[str, Any]:
        """Return grouped student/session summaries for the internal dashboard."""

        cache_key = (limit,)
        if not force_refresh:
            cached = self._get_cached_research_overview(cache_key)
            if cached is not None:
                return cached

        generated_at = datetime.now(timezone.utc)
        if not self._enabled:
            return {
                "persistence_enabled": False,
                "generated_at": generated_at,
                "session_count": 0,
                "students": [],
            }

        meta_items = self._scan_items(
            self._sessions_table,
            filter_expression=Attr("item_key").eq("SESSION#META"),
        )
        sessions = []
        for item in meta_items:
            session = self._session_summary_from_item(item)
            session_id = session.get("session_id")
            if session_id:
                session.update(self._session_activity_counts(str(session_id)))
            sessions.append(session)
        sessions.sort(
            key=lambda item: item.get("last_seen_at") or item.get("started_at") or "",
            reverse=True,
        )
        if limit is not None:
            sessions = sessions[:limit]

        students_by_id: dict[str, dict[str, Any]] = {}
        for session in sessions:
            student_id = session.get("student_id") or "Unknown student"
            student = students_by_id.setdefault(
                student_id,
                {
                    "student_id": student_id,
                    "session_count": 0,
                    "last_seen_at": None,
                    "sessions": [],
                },
            )
            student["session_count"] += 1
            student["sessions"].append(session)
            last_seen_at = session.get("last_seen_at") or session.get("started_at")
            if last_seen_at and (
                not student["last_seen_at"] or str(last_seen_at) > str(student["last_seen_at"])
            ):
                student["last_seen_at"] = last_seen_at

        students = list(students_by_id.values())
        students.sort(key=lambda item: item.get("last_seen_at") or "", reverse=True)

        overview = {
            "persistence_enabled": True,
            "generated_at": generated_at,
            "session_count": len(sessions),
            "students": students,
        }
        self._set_cached_research_overview(cache_key, overview)
        return overview

    def get_session_research_detail(self, session_id: str) -> dict[str, Any]:
        """Return all stored activity for one Saint Paul session."""

        generated_at = datetime.now(timezone.utc)
        if not self._enabled:
            return {
                "persistence_enabled": False,
                "generated_at": generated_at,
                "session": None,
                "pre_assessment": None,
                "post_assessment": None,
                "messages": [],
                "events": [],
                "errors": [],
                "generated_quizzes": [],
                "quiz_attempts": [],
                "generated_images": [],
            }

        session_items = self._query_items(
            self._sessions_table,
            key_condition_expression=Key("session_id").eq(session_id),
        )
        event_items = self._query_items(
            self._events_table,
            key_condition_expression=Key("session_id").eq(session_id),
        )
        error_items = self._query_items(
            self._errors_table,
            key_condition_expression=Key("session_id").eq(session_id),
        )

        session_meta: dict[str, Any] | None = None
        pre_assessment: dict[str, Any] | None = None
        post_assessment: dict[str, Any] | None = None
        messages: list[dict[str, Any]] = []
        generated_quizzes: list[dict[str, Any]] = []
        quiz_attempts: list[dict[str, Any]] = []
        generated_images: list[dict[str, Any]] = []

        for item in session_items:
            item_key = str(item.get("item_key") or "")
            if item_key == "SESSION#META":
                session_meta = self._session_summary_from_item(item)
            elif item_key == "ASSESSMENT#PRE":
                pre_assessment = self._assessment_from_item(item)
            elif item_key == "ASSESSMENT#POST":
                post_assessment = self._assessment_from_item(item)
            elif item_key.startswith("MESSAGE#"):
                messages.append(self._message_from_item(item))
            elif item_key.startswith("ARTIFACT#QUIZ#"):
                generated_quizzes.append(self._artifact_from_item(item))
            elif item_key.startswith("ARTIFACT#QUIZ_ATTEMPT#"):
                quiz_attempts.append(self._artifact_from_item(item))
            elif item_key.startswith("ARTIFACT#IMAGE#"):
                generated_images.append(self._artifact_from_item(item))

        events = [self._event_from_item(item) for item in event_items]
        errors = [self._error_from_item(item) for item in error_items]

        return {
            "persistence_enabled": True,
            "generated_at": generated_at,
            "session": session_meta,
            "pre_assessment": pre_assessment,
            "post_assessment": post_assessment,
            "messages": messages,
            "events": events,
            "errors": errors,
            "generated_quizzes": generated_quizzes,
            "quiz_attempts": quiz_attempts,
            "generated_images": generated_images,
        }

    def persist_quiz_artifact(
        self,
        *,
        session_id: str,
        student_id: str | None,
        objective_index: int | None,
        title: str,
        quiz_id: str,
        questions: list[dict[str, Any]],
        source: str,
        error: str | None,
        created_at: datetime | None = None,
    ) -> None:
        """Store a generated quiz artifact under the session table."""

        if not self._enabled:
            return

        recorded_at = created_at or datetime.now(timezone.utc)
        item = {
            "session_id": session_id,
            "item_key": (
                f"ARTIFACT#QUIZ#{objective_index if objective_index is not None else 'NA'}"
                f"#{recorded_at.isoformat()}#{quiz_id}"
            ),
            "item_type": "artifact_quiz",
            "student_id": student_id,
            "objective_index": objective_index,
            "quiz_id": quiz_id,
            "title": title,
            "questions": questions,
            "source": source,
            "error": error,
            "created_at": recorded_at.isoformat(),
        }
        self._put_item(self._sessions_table, item)

    def persist_image_artifact(
        self,
        *,
        session_id: str,
        student_id: str | None,
        objective_index: int | None,
        prompt: str,
        source: str,
        error: str | None,
        asset: SaintPaulAssetUploadResult | None,
        created_at: datetime | None = None,
    ) -> None:
        """Store generated image artifact metadata under the session table."""

        if not self._enabled:
            return

        artifact_id = uuid4().hex
        recorded_at = created_at or datetime.now(timezone.utc)
        item = {
            "session_id": session_id,
            "item_key": (
                f"ARTIFACT#IMAGE#{objective_index if objective_index is not None else 'NA'}"
                f"#{recorded_at.isoformat()}#{artifact_id}"
            ),
            "item_type": "artifact_image",
            "student_id": student_id,
            "objective_index": objective_index,
            "prompt": prompt,
            "source": source,
            "error": error,
            "created_at": recorded_at.isoformat(),
            "asset_bucket": asset.bucket if asset else None,
            "asset_key": asset.key if asset else None,
            "asset_url": asset.url if asset else None,
            "content_type": asset.content_type if asset else None,
            "size_bytes": asset.size_bytes if asset else None,
        }
        self._put_item(self._sessions_table, item)

    def upload_image_data_url(
        self,
        *,
        session_id: str,
        objective_index: int | None,
        image_data_url: str,
    ) -> SaintPaulAssetUploadResult | None:
        """Upload a generated image data URL to S3 and return its metadata."""

        if not self._assets_enabled:
            return None

        match = re.match(r"^data:(?P<content_type>[^;]+);base64,(?P<data>.+)$", image_data_url)
        if not match:
            raise SaintPaulPersistenceError("Generated image payload is not a base64 data URL")

        content_type = match.group("content_type")
        encoded = match.group("data")
        try:
            payload = base64.b64decode(encoded)
        except ValueError as exc:
            raise SaintPaulPersistenceError("Failed to decode generated image payload") from exc

        extension = self._content_type_to_extension(content_type)
        key = (
            f"saintpaul/session_id={session_id}/objective={objective_index if objective_index is not None else 'na'}"
            f"/images/{uuid4().hex}.{extension}"
        )
        extra_args = {"ContentType": content_type}
        try:
            self._s3_client.put_object(
                Bucket=self._assets_bucket,
                Key=key,
                Body=payload,
                **extra_args,
            )
        except Exception as exc:  # pragma: no cover - boto3 raises many specific errors
            raise SaintPaulPersistenceError("Failed to upload Saint Paul image to S3") from exc

        if self._region:
            url = f"https://{self._assets_bucket}.s3.{self._region}.amazonaws.com/{key}"
        else:
            url = f"https://{self._assets_bucket}.s3.amazonaws.com/{key}"

        return SaintPaulAssetUploadResult(
            bucket=self._assets_bucket,
            key=key,
            url=url,
            content_type=content_type,
            size_bytes=len(payload),
        )

    def prepare_reference_image_url(self, reference_image_url: str | None) -> str | None:
        """Return a model-readable image URL, presigning Saint Paul private assets if needed."""

        if not reference_image_url:
            return None
        if reference_image_url.startswith("data:"):
            return reference_image_url

        bucket, key = self._extract_bucket_and_key_from_url(reference_image_url)
        if bucket and key and bucket == self._assets_bucket:
            return (
                self._generate_asset_data_url(bucket, key)
                or self._generate_presigned_asset_url(bucket, key)
                or reference_image_url
            )
        return reference_image_url

    def _get_cached_research_overview(
        self, cache_key: tuple[int | None]
    ) -> dict[str, Any] | None:
        if not hasattr(self, "_research_overview_cache"):
            self._research_overview_cache = {}
            self._research_overview_cache_lock = RLock()

        with self._research_overview_cache_lock:
            cached = self._research_overview_cache.get(cache_key)
            return deepcopy(cached) if cached is not None else None

    def _set_cached_research_overview(
        self, cache_key: tuple[int | None], overview: dict[str, Any]
    ) -> None:
        if not hasattr(self, "_research_overview_cache"):
            self._research_overview_cache = {}
            self._research_overview_cache_lock = RLock()

        with self._research_overview_cache_lock:
            self._research_overview_cache[cache_key] = deepcopy(overview)

    def _put_item(self, table: Any, item: dict[str, Any]) -> None:
        if table is None:
            return

        try:
            table.put_item(Item=self._clean(item))
        except Exception as exc:  # pragma: no cover - boto3 raises many specific errors
            raise SaintPaulPersistenceError("Failed to write Saint Paul data to DynamoDB") from exc

    def _get_item(self, table: Any, *, key: dict[str, Any]) -> dict[str, Any] | None:
        if table is None:
            return None

        try:
            response = table.get_item(Key=self._clean(key))
        except Exception as exc:  # pragma: no cover - boto3 raises many specific errors
            raise SaintPaulPersistenceError("Failed to read Saint Paul data from DynamoDB") from exc
        item = response.get("Item")
        return item if isinstance(item, dict) else None

    def _query_items(self, table: Any, *, key_condition_expression: Any) -> list[dict[str, Any]]:
        if table is None:
            return []

        items: list[dict[str, Any]] = []
        exclusive_start_key: dict[str, Any] | None = None

        try:
            while True:
                kwargs: dict[str, Any] = {"KeyConditionExpression": key_condition_expression}
                if exclusive_start_key:
                    kwargs["ExclusiveStartKey"] = exclusive_start_key
                response = table.query(**kwargs)
                items.extend(response.get("Items", []))
                exclusive_start_key = response.get("LastEvaluatedKey")
                if not exclusive_start_key:
                    break
        except Exception as exc:  # pragma: no cover - boto3 raises many specific errors
            raise SaintPaulPersistenceError("Failed to read Saint Paul data from DynamoDB") from exc

        return [self._normalize_read_value(item) for item in items if isinstance(item, dict)]

    def _scan_items(
        self,
        table: Any,
        *,
        filter_expression: Any,
    ) -> list[dict[str, Any]]:
        if table is None:
            return []

        items: list[dict[str, Any]] = []
        exclusive_start_key: dict[str, Any] | None = None

        try:
            while True:
                kwargs: dict[str, Any] = {"FilterExpression": filter_expression}
                if exclusive_start_key:
                    kwargs["ExclusiveStartKey"] = exclusive_start_key
                response = table.scan(**kwargs)
                batch = response.get("Items", [])
                items.extend(item for item in batch if isinstance(item, dict))
                exclusive_start_key = response.get("LastEvaluatedKey")
                if not exclusive_start_key:
                    break
        except Exception as exc:  # pragma: no cover - boto3 raises many specific errors
            raise SaintPaulPersistenceError("Failed to read Saint Paul data from DynamoDB") from exc

        normalized = [self._normalize_read_value(item) for item in items]
        return normalized

    def _session_summary_from_item(self, item: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_read_value(item)
        return {
            "session_id": normalized.get("session_id"),
            "student_id": normalized.get("student_id"),
            "subject": normalized.get("subject"),
            "version": normalized.get("version"),
            "grade": normalized.get("grade"),
            "mode": normalized.get("mode"),
            "topic": normalized.get("topic"),
            "objectives": normalized.get("objectives", []),
            "current_tab": normalized.get("current_tab"),
            "active_objective_index": normalized.get("active_objective_index"),
            "objective_statuses": normalized.get("objective_statuses", []),
            "lesson_instruction_acknowledged": bool(
                normalized.get("lesson_instruction_acknowledged", False)
            ),
            "pre_quiz_submitted": bool(normalized.get("pre_quiz_submitted", False)),
            "post_quiz_submitted": bool(normalized.get("post_quiz_submitted", False)),
            "assessment_count": 0,
            "message_count": 0,
            "artifact_count": 0,
            "event_count": 0,
            "error_count": 0,
            "started_at": normalized.get("started_at"),
            "last_seen_at": normalized.get("last_seen_at"),
            "completed_at": normalized.get("completed_at"),
        }

    def _session_activity_counts(self, session_id: str) -> dict[str, int]:
        session_items = self._query_items(
            self._sessions_table,
            key_condition_expression=Key("session_id").eq(session_id),
        )
        event_items = self._query_items(
            self._events_table,
            key_condition_expression=Key("session_id").eq(session_id),
        )
        error_items = self._query_items(
            self._errors_table,
            key_condition_expression=Key("session_id").eq(session_id),
        )

        assessment_count = 0
        message_count = 0
        artifact_count = 0

        for item in session_items:
            item_key = str(item.get("item_key") or "")
            if item_key.startswith("ASSESSMENT#"):
                assessment_count += 1
            elif item_key.startswith("MESSAGE#"):
                message_count += 1
            elif item_key.startswith("ARTIFACT#"):
                artifact_count += 1

        return {
            "assessment_count": assessment_count,
            "message_count": message_count,
            "artifact_count": artifact_count,
            "event_count": len(event_items),
            "error_count": len(error_items),
        }

    def _assessment_from_item(self, item: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_read_value(item)
        return {
            "item_key": normalized.get("item_key"),
            "assessment_type": normalized.get("assessment_type"),
            "student_id": normalized.get("student_id"),
            "responses": normalized.get("responses", {}),
            "submitted_at": normalized.get("submitted_at"),
        }

    def _message_from_item(self, item: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_read_value(item)
        return {
            "item_key": normalized.get("item_key"),
            "student_id": normalized.get("student_id"),
            "objective_index": normalized.get("objective_index"),
            "message_id": normalized.get("message_id"),
            "role": normalized.get("role"),
            "content": normalized.get("content"),
            "model": normalized.get("model"),
            "created_at": normalized.get("created_at"),
        }

    def _event_from_item(self, item: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_read_value(item)
        return {
            "item_key": normalized.get("item_key"),
            "event_id": normalized.get("event_id"),
            "student_id": normalized.get("student_id"),
            "event_type": normalized.get("event_type"),
            "tab": normalized.get("tab"),
            "objective_index": normalized.get("objective_index"),
            "client_timestamp": normalized.get("client_timestamp"),
            "recorded_at": normalized.get("recorded_at"),
            "payload": normalized.get("payload", {}),
        }

    def _error_from_item(self, item: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_read_value(item)
        return {
            "item_key": normalized.get("item_key"),
            "error_id": normalized.get("error_id"),
            "student_id": normalized.get("student_id"),
            "stage": normalized.get("stage"),
            "error_scope": normalized.get("error_scope"),
            "error_code": normalized.get("error_code"),
            "error_message": normalized.get("error_message"),
            "raw_error": normalized.get("raw_error"),
            "tab": normalized.get("tab"),
            "objective_index": normalized.get("objective_index"),
            "request_id": normalized.get("request_id"),
            "metadata": normalized.get("metadata", {}),
            "recorded_at": normalized.get("recorded_at"),
        }

    def _artifact_from_item(self, item: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_read_value(item)
        asset_bucket = normalized.get("asset_bucket")
        asset_key = normalized.get("asset_key")
        return {
            "item_key": normalized.get("item_key"),
            "item_type": normalized.get("item_type"),
            "student_id": normalized.get("student_id"),
            "objective_index": normalized.get("objective_index"),
            "quiz_id": normalized.get("quiz_id"),
            "title": normalized.get("title"),
            "score": normalized.get("score"),
            "total_questions": normalized.get("total_questions"),
            "error": normalized.get("error"),
            "questions": normalized.get("questions", []),
            "prompt": normalized.get("prompt"),
            "source": normalized.get("source"),
            "asset_bucket": asset_bucket,
            "asset_key": asset_key,
            "asset_url": self._generate_presigned_asset_url(asset_bucket, asset_key)
            or normalized.get("asset_url"),
            "content_type": normalized.get("content_type"),
            "size_bytes": normalized.get("size_bytes"),
            "created_at": normalized.get("created_at"),
            "submitted_at": normalized.get("submitted_at"),
        }

    def _generate_presigned_asset_url(
        self, bucket: str | None, key: str | None, expires_in: int = 3600
    ) -> str | None:
        if not bucket or not key:
            return None

        try:
            return self._s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        except Exception:
            return None

    def _generate_asset_data_url(self, bucket: str | None, key: str | None) -> str | None:
        if not bucket or not key:
            return None

        try:
            response = self._s3_client.get_object(Bucket=bucket, Key=key)
            body = response["Body"].read()
        except Exception:
            return None

        if not body:
            return None

        content_type = response.get("ContentType") or mimetypes.guess_type(key)[0] or "image/png"
        encoded = base64.b64encode(body).decode("ascii")
        return f"data:{content_type};base64,{encoded}"

    def _extract_bucket_and_key_from_url(self, value: str) -> tuple[str | None, str | None]:
        try:
            parsed = urlparse(value)
        except Exception:
            return None, None

        if parsed.scheme not in {"http", "https"} or not parsed.netloc or not parsed.path:
            return None, None

        host = parsed.netloc.lower()
        path = unquote(parsed.path.lstrip("/"))
        if not path:
            return None, None

        if ".s3." in host:
            bucket = host.split(".s3.", 1)[0]
            return bucket or None, path
        if host.endswith(".s3.amazonaws.com"):
            bucket = host[: -len(".s3.amazonaws.com")]
            return bucket or None, path
        return None, None

    def _normalize_read_value(self, value: Any) -> Any:
        if isinstance(value, Decimal):
            if value % 1 == 0:
                return int(value)
            return float(value)
        if isinstance(value, dict):
            return {key: self._normalize_read_value(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self._normalize_read_value(item) for item in value]
        return value

    def _clean(self, value: Any) -> Any:
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            return {
                key: self._clean(item)
                for key, item in value.items()
                if item is not None
            }
        if isinstance(value, list):
            return [self._clean(item) for item in value]
        return value

    def _content_type_to_extension(self, content_type: str) -> str:
        mapping = {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/webp": "webp",
            "image/svg+xml": "svg",
        }
        return mapping.get(content_type, "bin")


__all__ = [
    "SaintPaulAssetUploadResult",
    "SaintPaulPersistenceError",
    "SaintPaulPersistenceService",
]
