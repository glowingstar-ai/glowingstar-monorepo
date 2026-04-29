"""Pydantic models for the Tutor Mode feature."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TutorModeRequest(BaseModel):
    """Incoming payload describing the tutoring objective."""

    topic: str = Field(..., description="Subject or concept the learner wants to explore")
    student_level: str | None = Field(
        default=None,
        description="Quick description of the learner's current understanding",
    )
    goals: list[str] | None = Field(
        default=None,
        description="Learning goals or outcomes the learner cares about",
    )
    preferred_modalities: list[str] | None = Field(
        default=None,
        description="Modalities that resonate with the learner (e.g. visuals, demos)",
    )
    additional_context: str | None = Field(
        default=None,
        description="Any extra context that can help the tutor personalize the plan",
    )


class TutorChatMessage(BaseModel):
    """Single tutor chat turn."""

    role: Literal["user", "assistant"] = Field(
        description="Speaker role in the conversation history"
    )
    content: str = Field(description="Plain text content for the turn")


class TutorChatRequest(BaseModel):
    """Student-facing tutor chat request."""

    session_id: str | None = Field(default=None, description="Saint Paul session id")
    student_id: str | None = Field(default=None, description="Student identifier")
    objective_index: int | None = Field(
        default=None,
        ge=0,
        description="Zero-based active objective index",
    )
    topic: str = Field(..., description="Lesson topic shown to the student")
    objective: str = Field(..., description="Currently selected learning objective")
    objectives: list[str] = Field(
        default_factory=list,
        description="All learning objectives for the lesson so the tutor can stay scoped",
    )
    messages: list[TutorChatMessage] = Field(
        default_factory=list,
        description="Conversation history including the latest student message",
    )
    quiz_history: list["TutorQuizHistoryItem"] = Field(
        default_factory=list,
        description="Previously generated quizzes and the student's choices",
    )


class TutorChatResponse(BaseModel):
    """Assistant reply for the student-facing tutor experience."""

    model: str = Field(description="Model powering the reply")
    message: TutorChatMessage


class TutorImageExplanationRequest(BaseModel):
    """Generate a visual explanation for the current learning objective."""

    session_id: str | None = Field(default=None, description="Saint Paul session id")
    student_id: str | None = Field(default=None, description="Student identifier")
    objective_index: int | None = Field(
        default=None,
        ge=0,
        description="Zero-based active objective index",
    )
    topic: str = Field(..., description="Lesson topic shown to the student")
    objective: str = Field(..., description="Currently selected learning objective")
    objectives: list[str] = Field(
        default_factory=list,
        description="All lesson objectives for additional context",
    )
    messages: list[TutorChatMessage] = Field(
        default_factory=list,
        description="Conversation history for the active learning objective",
    )
    quiz_history: list["TutorQuizHistoryItem"] = Field(
        default_factory=list,
        description="Previously generated quizzes and the student's choices",
    )


class TutorImageExplanationResponse(BaseModel):
    """Image explanation payload for the student-facing tutor experience."""

    model: str = Field(description="Model powering the image explanation")
    prompt: str = Field(description="Prompt used to generate the explanation image")
    image_data_url: str = Field(description="Rendered image as a browser-ready data URL")
    source: Literal["openai", "fallback"] = Field(
        description="Whether the image came from OpenAI or the local fallback renderer"
    )
    error: str | None = Field(
        default=None,
        description="Fallback reason when OpenAI image generation failed",
    )
    asset_bucket: str | None = Field(
        default=None,
        description="S3 bucket storing the generated image asset",
    )
    asset_key: str | None = Field(
        default=None,
        description="S3 object key storing the generated image asset",
    )
    asset_url: str | None = Field(
        default=None,
        description="Public object URL when available",
    )


class TutorQuizOption(BaseModel):
    """One multiple-choice option for a generated quiz question."""

    id: str = Field(description="Stable option identifier such as A/B/C/D")
    text: str = Field(description="Traditional Chinese answer option text")


class TutorQuizQuestion(BaseModel):
    """Multiple-choice quiz question with answer key."""

    id: str = Field(description="Stable question identifier")
    prompt: str = Field(description="Question prompt shown to the student")
    options: list[TutorQuizOption] = Field(
        default_factory=list,
        description="List of answer options",
    )
    correct_option_id: str = Field(description="Correct option id")
    explanation: str | None = Field(
        default=None,
        description="Short explanation shown after submission",
    )


class TutorQuizQuestionHistory(TutorQuizQuestion):
    """Quiz question plus the student's answer state."""

    selected_option_id: str | None = Field(
        default=None,
        description="Student-selected option id",
    )
    is_correct: bool | None = Field(
        default=None,
        description="Whether the student's answer was correct",
    )


class TutorQuizHistoryItem(BaseModel):
    """One previously generated quiz attempt."""

    quiz_id: str = Field(description="Stable quiz instance identifier")
    title: str = Field(description="Quiz title shown to the student")
    questions: list[TutorQuizQuestionHistory] = Field(
        default_factory=list,
        description="Questions, answer keys, and student selections",
    )
    score: int | None = Field(
        default=None,
        description="Number of correct answers in this quiz attempt",
    )
    total_questions: int | None = Field(
        default=None,
        description="Total number of questions in this quiz attempt",
    )


class TutorQuizRequest(BaseModel):
    """Generate a fresh multiple-choice quiz for the active learning objective."""

    session_id: str | None = Field(default=None, description="Saint Paul session id")
    student_id: str | None = Field(default=None, description="Student identifier")
    objective_index: int | None = Field(
        default=None,
        ge=0,
        description="Zero-based active objective index",
    )
    topic: str = Field(..., description="Lesson topic shown to the student")
    objective: str = Field(..., description="Currently selected learning objective")
    objectives: list[str] = Field(
        default_factory=list,
        description="All lesson objectives for additional context",
    )
    messages: list[TutorChatMessage] = Field(
        default_factory=list,
        description="Conversation history for the active learning objective",
    )
    quiz_history: list[TutorQuizHistoryItem] = Field(
        default_factory=list,
        description="Previously generated quizzes and the student's choices",
    )
    question_count: int = Field(
        default=3,
        ge=1,
        le=5,
        description="Number of multiple-choice questions to generate",
    )


class TutorQuizResponse(BaseModel):
    """Freshly generated quiz payload."""

    model: str = Field(description="Model powering the quiz generation")
    quiz_id: str = Field(description="Stable quiz instance identifier")
    title: str = Field(description="Quiz title shown to the student")
    questions: list[TutorQuizQuestion] = Field(
        default_factory=list,
        description="Multiple-choice questions with answer keys",
    )
    source: Literal["openai", "fallback"] = Field(
        description="Whether the quiz came from OpenAI or the local fallback generator"
    )
    error: str | None = Field(
        default=None,
        description="Fallback reason when OpenAI quiz generation failed",
    )


class TutorUnderstandingPlan(BaseModel):
    """Step 0 – capture how the tutor will gauge the learner's level."""

    approach: str
    diagnostic_questions: list[str]
    signals_to_watch: list[str]
    beginner_flag_logic: str = Field(
        default="Classify the learner as a beginner when answers show limited prior knowledge.",
        description="How the tutor converts qualitative signals into the beginner boolean flag",
    )
    follow_up_questions: list[str] = Field(
        default_factory=list,
        description="Additional probes asked when the learner is not a beginner",
    )
    max_follow_up_iterations: int = Field(
        default=3,
        description="Maximum number of iterations before moving on",
    )
    escalation_strategy: str = Field(
        default="Summarise what you learned and explain how you will adapt the plan before continuing.",
        description="What the tutor does if understanding remains unclear after follow ups",
    )


class TutorConceptBreakdown(BaseModel):
    """Step 1 – structured concepts and reasoning."""

    concept: str
    llm_reasoning: str
    subtopics: list[str]
    real_world_connections: list[str]
    prerequisites: list[str] = Field(
        default_factory=list,
        description="Concepts that must be mastered before this one",
    )
    mastery_checks: list[str] = Field(
        default_factory=list,
        description="Observable indicators that the learner is ready to advance",
    )
    remediation_plan: str = Field(
        default="Offer a quick formative quiz and revisit the prerequisite concept with a new example.",
        description="Action taken when mastery checks are not met",
    )
    advancement_cue: str = Field(
        default="Acknowledge success and transition to the next concept with an applied challenge.",
        description="How to celebrate/transition after a pass",
    )


class TutorTeachingModality(BaseModel):
    """Step 2 – multi-modal explanation strategy."""

    modality: Literal["visual", "verbal", "interactive", "experiential", "reading", "other"]
    description: str
    resources: list[str]


class TutorAssessmentItem(BaseModel):
    """Single assessment artifact for Step 3."""

    prompt: str
    kind: Literal["multiple_choice", "short_answer", "reflection", "practical"]
    options: list[str] | None = None
    answer_key: str | None = None


class TutorAssessmentPlan(BaseModel):
    """Step 3 – checks for understanding with human-in-the-loop guidance."""

    title: str
    format: str
    human_in_the_loop_notes: str
    items: list[TutorAssessmentItem]


class TutorConversationManager(BaseModel):
    """High-level directives for the GPT-5 manager orchestrating the session."""

    agent_role: str
    topic_extraction_prompt: str
    level_assessment_summary: str
    containment_strategy: str


class TutorStageQuiz(BaseModel):
    """Quiz blueprint attached to a learning stage."""

    prompt: str
    answer_key: str | None = None
    remediation: str


class TutorLearningStage(BaseModel):
    """Learning stage that enforces pass/fail progression rules."""

    name: str
    focus: str
    objectives: list[str]
    prerequisites: list[str]
    pass_criteria: list[str]
    quiz: TutorStageQuiz
    on_success: str
    on_failure: str


class TutorCompletionPlan(BaseModel):
    """Step 4 – how the agent knows instruction is complete."""

    mastery_indicators: list[str]
    wrap_up_plan: str
    follow_up_suggestions: list[str]


class TutorModeResponse(BaseModel):
    """Comprehensive tutor mode plan returned to clients."""

    model: str = Field(description="Model powering the plan")
    generated_at: datetime
    topic: str
    learner_profile: str
    objectives: list[str]
    understanding: TutorUnderstandingPlan
    concept_breakdown: list[TutorConceptBreakdown]
    teaching_modalities: list[TutorTeachingModality]
    assessment: TutorAssessmentPlan
    completion: TutorCompletionPlan
    conversation_manager: TutorConversationManager
    learning_stages: list[TutorLearningStage]


TutorChatRequest.model_rebuild()
TutorImageExplanationRequest.model_rebuild()
TutorQuizRequest.model_rebuild()
