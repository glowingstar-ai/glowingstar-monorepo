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
