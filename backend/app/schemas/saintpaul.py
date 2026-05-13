"""Schemas for Saint Paul student-session persistence."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SaintPaulSessionStartRequest(BaseModel):
    """Create a persisted Saint Paul student session."""

    student_id: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    version: str = Field(..., min_length=1)
    grade: str = Field(..., min_length=1)
    mode: str = Field(..., min_length=1)
    topic: str = Field(..., min_length=1)
    objectives: list[str] = Field(default_factory=list)


class SaintPaulSessionStartResponse(BaseModel):
    """Result returned after creating a session."""

    session_id: str
    started_at: datetime
    persistence_enabled: bool


class SaintPaulSessionSnapshotRequest(BaseModel):
    """Persist the latest recoverable student-session state."""

    session_id: str = Field(..., min_length=1)
    student_id: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    version: str = Field(..., min_length=1)
    grade: str = Field(..., min_length=1)
    mode: str = Field(..., min_length=1)
    topic: str = Field(..., min_length=1)
    objectives: list[str] = Field(default_factory=list)
    current_tab: str = Field(..., min_length=1)
    active_objective_index: int = Field(default=0, ge=0)
    objective_statuses: list[str] = Field(default_factory=list)
    lesson_instruction_acknowledged: bool = False
    pre_quiz_submitted: bool = False
    post_quiz_submitted: bool = False
    pre_quiz_responses: dict[str, dict[str, str]] = Field(default_factory=dict)
    post_quiz_responses: dict[str, dict[str, str]] = Field(default_factory=dict)
    completed_at: datetime | None = None


class SaintPaulSessionSnapshotResponse(BaseModel):
    """Acknowledgement for snapshot persistence."""

    saved_at: datetime
    persistence_enabled: bool


class SaintPaulSessionMessageRequest(BaseModel):
    """Persist one Saint Paul session message."""

    session_id: str = Field(..., min_length=1)
    student_id: str | None = None
    objective_index: int | None = Field(default=None, ge=0)
    role: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    model: str | None = None
    message_key: str | None = None
    created_at: datetime | None = None


class SaintPaulSessionMessageResponse(BaseModel):
    """Acknowledgement for session message persistence."""

    saved_at: datetime
    persistence_enabled: bool


class SaintPaulQuizAttemptQuestionOption(BaseModel):
    """One answer option in a persisted AI quiz attempt."""

    id: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


class SaintPaulQuizAttemptQuestion(BaseModel):
    """One fully graded question in a persisted AI quiz attempt."""

    id: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=1)
    options: list[SaintPaulQuizAttemptQuestionOption] = Field(default_factory=list)
    correct_option_id: str = Field(..., min_length=1)
    explanation: str | None = None
    selected_option_id: str | None = None
    is_correct: bool | None = None


class SaintPaulQuizAttemptRequest(BaseModel):
    """Persist a completed AI quiz attempt snapshot."""

    session_id: str = Field(..., min_length=1)
    student_id: str = Field(..., min_length=1)
    objective_index: int = Field(..., ge=0)
    quiz_id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    score: int | None = Field(default=None, ge=0)
    total_questions: int = Field(..., ge=1)
    error: str | None = None
    questions: list[SaintPaulQuizAttemptQuestion] = Field(default_factory=list)
    submitted_at: datetime | None = None


class SaintPaulQuizAttemptResponse(BaseModel):
    """Acknowledgement for AI quiz attempt persistence."""

    saved_at: datetime
    persistence_enabled: bool


class SaintPaulEventRequest(BaseModel):
    """Append a Saint Paul event log entry."""

    session_id: str = Field(..., min_length=1)
    student_id: str = Field(..., min_length=1)
    event_type: str = Field(..., min_length=1)
    tab: str | None = None
    objective_index: int | None = Field(default=None, ge=0)
    client_timestamp: datetime | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class SaintPaulEventResponse(BaseModel):
    """Acknowledgement for event ingestion."""

    event_id: str
    recorded_at: datetime
    persistence_enabled: bool


class SaintPaulErrorRecord(BaseModel):
    """Structured Saint Paul error payload."""

    session_id: str = Field(..., min_length=1)
    student_id: str | None = None
    stage: str = Field(..., min_length=1)
    error_scope: str = Field(..., min_length=1)
    error_message: str = Field(..., min_length=1)
    raw_error: str | None = None
    error_code: str | None = None
    tab: str | None = None
    objective_index: int | None = Field(default=None, ge=0)
    request_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class SaintPaulResearchSessionSummary(BaseModel):
    """Compact session summary for the internal Saint Paul dashboard."""

    session_id: str
    student_id: str | None = None
    subject: str | None = None
    version: str | None = None
    grade: str | None = None
    mode: str | None = None
    topic: str | None = None
    objectives: list[str] = Field(default_factory=list)
    current_tab: str | None = None
    active_objective_index: int | None = None
    objective_statuses: list[str] = Field(default_factory=list)
    lesson_instruction_acknowledged: bool = False
    pre_quiz_submitted: bool = False
    post_quiz_submitted: bool = False
    assessment_count: int = Field(default=0, ge=0)
    message_count: int = Field(default=0, ge=0)
    artifact_count: int = Field(default=0, ge=0)
    event_count: int = Field(default=0, ge=0)
    error_count: int = Field(default=0, ge=0)
    started_at: datetime | None = None
    last_seen_at: datetime | None = None
    completed_at: datetime | None = None


class SaintPaulResearchStudentSummary(BaseModel):
    """Grouped student summary containing recent sessions."""

    student_id: str
    session_count: int = Field(default=0, ge=0)
    last_seen_at: datetime | None = None
    sessions: list[SaintPaulResearchSessionSummary] = Field(default_factory=list)


class SaintPaulResearchOverviewResponse(BaseModel):
    """Top-level student activity index for the internal dashboard."""

    persistence_enabled: bool
    generated_at: datetime
    session_count: int = Field(default=0, ge=0)
    students: list[SaintPaulResearchStudentSummary] = Field(default_factory=list)


class SaintPaulResearchAssessmentRecord(BaseModel):
    """One persisted pre- or post-assessment payload."""

    item_key: str
    assessment_type: str
    student_id: str | None = None
    responses: dict[str, dict[str, Any]] = Field(default_factory=dict)
    submitted_at: datetime | None = None


class SaintPaulResearchMessageRecord(BaseModel):
    """One persisted tutor chat message."""

    item_key: str
    student_id: str | None = None
    objective_index: int | None = None
    message_id: str | None = None
    role: str | None = None
    content: str | None = None
    model: str | None = None
    created_at: datetime | None = None


class SaintPaulResearchEventRecord(BaseModel):
    """One interaction telemetry record."""

    item_key: str
    event_id: str | None = None
    student_id: str | None = None
    event_type: str | None = None
    tab: str | None = None
    objective_index: int | None = None
    client_timestamp: datetime | None = None
    recorded_at: datetime | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class SaintPaulResearchErrorRecord(BaseModel):
    """One stored Saint Paul error entry."""

    item_key: str
    error_id: str | None = None
    student_id: str | None = None
    stage: str | None = None
    error_scope: str | None = None
    error_code: str | None = None
    error_message: str | None = None
    raw_error: str | None = None
    tab: str | None = None
    objective_index: int | None = None
    request_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    recorded_at: datetime | None = None


class SaintPaulResearchArtifactRecord(BaseModel):
    """One stored quiz or image artifact record."""

    item_key: str
    item_type: str
    student_id: str | None = None
    objective_index: int | None = None
    quiz_id: str | None = None
    title: str | None = None
    score: float | int | None = None
    total_questions: int | None = None
    error: str | None = None
    questions: list[dict[str, Any]] = Field(default_factory=list)
    prompt: str | None = None
    source: str | None = None
    asset_bucket: str | None = None
    asset_key: str | None = None
    asset_url: str | None = None
    content_type: str | None = None
    size_bytes: int | None = None
    created_at: datetime | None = None
    submitted_at: datetime | None = None


class SaintPaulResearchSessionDetailResponse(BaseModel):
    """Full activity drilldown for one Saint Paul session."""

    persistence_enabled: bool
    generated_at: datetime
    session: SaintPaulResearchSessionSummary | None = None
    pre_assessment: SaintPaulResearchAssessmentRecord | None = None
    post_assessment: SaintPaulResearchAssessmentRecord | None = None
    messages: list[SaintPaulResearchMessageRecord] = Field(default_factory=list)
    events: list[SaintPaulResearchEventRecord] = Field(default_factory=list)
    errors: list[SaintPaulResearchErrorRecord] = Field(default_factory=list)
    generated_quizzes: list[SaintPaulResearchArtifactRecord] = Field(default_factory=list)
    quiz_attempts: list[SaintPaulResearchArtifactRecord] = Field(default_factory=list)
    generated_images: list[SaintPaulResearchArtifactRecord] = Field(default_factory=list)
