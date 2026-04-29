"""Persistence service for the Saint Paul student workflow."""

from __future__ import annotations

import base64
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import boto3

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
    ) -> datetime:
        """Store one chat message as a first-class session item."""

        recorded_at = created_at or datetime.now(timezone.utc)
        if not self._enabled:
            return recorded_at

        message_id = uuid4().hex
        item = {
            "session_id": session_id,
            "item_key": (
                f"MESSAGE#{objective_index if objective_index is not None else 'NA'}"
                f"#{recorded_at.isoformat()}#{message_id}"
            ),
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
