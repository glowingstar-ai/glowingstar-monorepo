"""Tutor mode orchestration powered by GPT-5 (with graceful fallbacks)."""

from __future__ import annotations

import base64
import json
from datetime import datetime, timezone
from html import escape
from textwrap import dedent
from typing import Any
from uuid import uuid4

import httpx

from app.schemas.tutor import (
    TutorChatMessage,
    TutorChatRequest,
    TutorChatResponse,
    TutorConversationManager,
    TutorAssessmentItem,
    TutorAssessmentPlan,
    TutorCompletionPlan,
    TutorConceptBreakdown,
    TutorImageExplanationRequest,
    TutorImageExplanationResponse,
    TutorQuizHistoryItem,
    TutorQuizOption,
    TutorQuizQuestion,
    TutorQuizRequest,
    TutorQuizResponse,
    TutorLearningStage,
    TutorModeRequest,
    TutorModeResponse,
    TutorStageQuiz,
    TutorTeachingModality,
    TutorUnderstandingPlan,
)


class TutorModeService:
    """Generate an agentic tutoring plan using GPT-5 or an offline heuristic."""

    def __init__(
        self,
        *,
        api_key: str | None,
        base_url: str,
        model: str,
        image_model: str,
        timeout: float = 30.0,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.image_model = image_model
        self.timeout = timeout

    async def generate_plan(self, payload: TutorModeRequest) -> TutorModeResponse:
        """Return a structured tutor plan, attempting GPT-5 first."""

        if not self.api_key:
            return self._offline_plan(payload)

        try:
            response_json = await self._call_openai(payload)
            return self._from_openai(payload, response_json)
        except Exception:
            return self._offline_plan(payload)

    async def chat_with_student(self, payload: TutorChatRequest) -> TutorChatResponse:
        """Generate a student-facing tutor reply scoped to one learning objective."""

        if not self.api_key:
            return self._offline_chat_response(payload)

        try:
            response_text = await self._call_openai_chat(payload)
            return TutorChatResponse(
                model=self.model,
                message=TutorChatMessage(role="assistant", content=response_text),
            )
        except Exception:
            return self._offline_chat_response(payload)

    async def generate_image_explanation(
        self, payload: TutorImageExplanationRequest
    ) -> TutorImageExplanationResponse:
        """Generate a visual explanation for the active learning objective."""

        prompt = self._build_image_prompt(payload)

        if not self.api_key:
            return TutorImageExplanationResponse(
                model=self.image_model,
                prompt=prompt,
                image_data_url=self._offline_image_data_url(payload.objective),
                source="fallback",
                error="目前無法連接圖像服務，已改為顯示備援圖示。",
            )

        try:
            image_data_url = await self._call_openai_image(prompt)
            return TutorImageExplanationResponse(
                model=self.image_model,
                prompt=prompt,
                image_data_url=image_data_url,
                source="openai",
                error=None,
            )
        except Exception:
            return TutorImageExplanationResponse(
                model=self.image_model,
                prompt=prompt,
                image_data_url=self._offline_image_data_url(payload.objective),
                source="fallback",
                error="目前無法生成真實圖像，已改為顯示備援圖示。",
            )

    async def generate_quiz(self, payload: TutorQuizRequest) -> TutorQuizResponse:
        """Generate a new multiple-choice quiz for the active learning objective."""

        if not self.api_key:
            return self._offline_quiz_response(
                payload,
                error="目前無法連接測驗服務，已改為顯示備援題目。",
            )

        try:
            response_json = await self._call_openai_quiz(payload)
            return self._from_openai_quiz(payload, response_json)
        except Exception:
            return self._offline_quiz_response(
                payload,
                error="目前無法生成新的測驗，已改為顯示備援題目。",
            )

    async def _call_openai(self, payload: TutorModeRequest) -> dict[str, Any]:
        """Invoke the OpenAI Responses API requesting a JSON plan."""

        prompt = dedent(
            f"""
            You are BabyAGI operating in tutor mode and powered by {self.model}. Act as the GPT-5
            manager orchestrating sub-agents inside a single chat conversation. Use the student
            profile below to create a JSON-only tutoring plan that extracts the topic, diagnoses
            level with a beginner flag, routes through staged concepts, and loops in quizzes when
            a learner needs remediation.

            Student profile:
            - Topic: {payload.topic}
            - Student level: {payload.student_level or 'unspecified'}
            - Goals: {', '.join(payload.goals or ['not provided'])}
            - Preferred modalities: {', '.join(payload.preferred_modalities or ['not provided'])}
            - Additional context: {payload.additional_context or 'none'}

            The JSON schema (tutor_plan) must contain:
            {{
              "model": string,
              "learner_profile": string,
              "objectives": string array,
              "understanding": {{
                "approach": string,
                "diagnostic_questions": string array,
                "signals_to_watch": string array,
                "beginner_flag_logic": string,
                "follow_up_questions": string array,
                "max_follow_up_iterations": integer,
                "escalation_strategy": string
              }},
              "concept_breakdown": array of {{
                "concept": string,
                "llm_reasoning": string,
                "subtopics": string array,
                "real_world_connections": string array,
                "prerequisites": string array,
                "mastery_checks": string array,
                "remediation_plan": string,
                "advancement_cue": string
              }},
              "teaching_modalities": array of {{
                "modality": string,
                "description": string,
                "resources": string array
              }},
              "assessment": {{
                "title": string,
                "format": string,
                "human_in_the_loop_notes": string,
                "items": array of {{
                  "prompt": string,
                  "kind": string,
                  "options": string array or null,
                  "answer_key": string or null
                }}
              }},
              "completion": {{
                "mastery_indicators": string array,
                "wrap_up_plan": string,
                "follow_up_suggestions": string array
              }},
              "conversation_manager": {{
                "agent_role": string,
                "topic_extraction_prompt": string,
                "level_assessment_summary": string,
                "containment_strategy": string
              }},
              "learning_stages": array of {{
                "name": string,
                "focus": string,
                "objectives": string array,
                "prerequisites": string array,
                "pass_criteria": string array,
                "quiz": {{
                  "prompt": string,
                  "answer_key": string or null,
                  "remediation": string
                }},
                "on_success": string,
                "on_failure": string
              }}
            }}

            Explicitly detail how the manager keeps the dialogue inside the chat, confirms the
            topic, and asks up to three follow-up questions when the beginner flag is False before
            escalating. Ensure each learning stage clearly states how to progress only after passing
            a quiz or mastery check, and how to remediate otherwise.
            """
        ).strip()

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        body: dict[str, Any] = {
            "model": self.model,
            "input": prompt,
            "text": {
                "format": {
                    "type": "json_object"
                }
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/responses", headers=headers, json=body
            )
        response.raise_for_status()

        data = response.json()
        # The Responses API returns JSON content in various spots; prefer direct JSON.
        if isinstance(data, dict) and "output" in data:
            for item in data.get("output", []):
                if item.get("type") == "output_text":
                    return httpx.Response(200, text=item.get("text", "{}"), request=response.request).json()
        if isinstance(data, dict) and "output_text" in data:
            return httpx.Response(200, text=data.get("output_text", "{}"), request=response.request).json()
        if isinstance(data, dict) and "response" in data:
            return data["response"]
        return data

    async def _call_openai_chat(self, payload: TutorChatRequest) -> str:
        """Invoke the OpenAI Responses API for a student-facing tutor reply."""

        conversation_lines = [
            f"{'學生' if message.role == 'user' else 'AI 導師'}: {message.content}"
            for message in payload.messages
        ]
        objectives = payload.objectives or [payload.objective]
        quiz_history_summary = self._summarize_quiz_history(payload.quiz_history)
        prompt = dedent(
            f"""
            你是一位面向中學生的 AI 導師。請全程使用繁體中文，語氣清楚、耐心、鼓勵思考，
            不要直接代替學生完成作業；優先用提問、拆解、舉例與提示來引導。

            課堂主題：{payload.topic}
            目前聚焦的學習目標：{payload.objective}
            全部學習目標：
            {chr(10).join(f"- {objective}" for objective in objectives)}

            規則：
            - 僅聚焦在目前的學習目標。
            - 先判斷學生卡住的地方，再給出一步一步的引導。
            - 回答保持精簡，最多 5 句。
            - 如果適合，可提出 1 個小問題確認理解。
            - 不要輸出 markdown 標題，不要輸出 JSON。

            對話紀錄：
            {chr(10).join(conversation_lines) if conversation_lines else '學生尚未發問。'}

            先前測驗紀錄：
            {quiz_history_summary}
            """
        ).strip()

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        body: dict[str, Any] = {
            "model": self.model,
            "input": prompt,
            "reasoning": {"effort": "medium"},
            "text": {"verbosity": "medium"},
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/responses", headers=headers, json=body
            )
        response.raise_for_status()

        data = response.json()
        return self._extract_output_text(data)

    async def _call_openai_image(self, prompt: str) -> str:
        """Invoke the OpenAI image generation API and return a data URL."""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        body: dict[str, Any] = {
            "model": self.image_model,
            "prompt": prompt,
            "size": "1024x1024",
            "quality": "low",
        }

        async with httpx.AsyncClient(timeout=max(self.timeout, 120.0)) as client:
            response = await client.post(
                f"{self.base_url}/images/generations", headers=headers, json=body
            )
        response.raise_for_status()

        data = response.json()
        image_payload = (data.get("data") or [{}])[0]
        image_b64 = image_payload.get("b64_json")
        if image_b64:
            return f"data:image/png;base64,{image_b64}"

        image_url = image_payload.get("url")
        if image_url:
            return image_url

        raise ValueError("Unexpected response from image generation API")

    async def _call_openai_quiz(self, payload: TutorQuizRequest) -> dict[str, Any]:
        """Invoke the OpenAI Responses API for a JSON-only multiple-choice quiz."""

        prompt = self._build_quiz_prompt(payload)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        body: dict[str, Any] = {
            "model": self.model,
            "input": prompt,
            "reasoning": {"effort": "medium"},
            "text": {"format": {"type": "json_object"}},
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/responses", headers=headers, json=body
            )
        response.raise_for_status()

        return json.loads(self._extract_output_text(response.json()))

    def _extract_output_text(self, data: dict[str, Any]) -> str:
        """Extract assistant text from a Responses API payload."""

        output_items = data.get("output", [])
        for item in output_items:
            if item.get("type") == "message":
                for content_item in item.get("content", []):
                    if content_item.get("type") == "output_text":
                        text = (content_item.get("text") or "").strip()
                        if text:
                            return text

            if item.get("type") == "output_text":
                text = (item.get("text") or "").strip()
                if text:
                    return text

        output_text = data.get("output_text")
        if isinstance(output_text, str) and output_text.strip():
            return output_text.strip()

        raise ValueError("No output text found in response")

    def _build_image_prompt(self, payload: TutorImageExplanationRequest) -> str:
        """Return a teaching-oriented prompt for image explanation generation."""

        objectives = payload.objectives or [payload.objective]
        conversation_lines = [
            f"{'學生' if message.role == 'user' else 'AI 導師'}：{message.content}"
            for message in payload.messages[-6:]
        ]
        quiz_history_summary = self._summarize_quiz_history(payload.quiz_history)
        return dedent(
            f"""
            請為中學生製作一張繁體中文的教學圖像，用來解釋目前正在學習的內容。

            課堂主題：{payload.topic}
            主要學習目標：{payload.objective}
            其他相關學習目標：
            {chr(10).join(f"- {objective}" for objective in objectives)}

            目前對話重點：
            {chr(10).join(conversation_lines) if conversation_lines else "目前沒有額外對話內容。"}

            先前測驗紀錄：
            {quiz_history_summary}

            要求：
            - 使用繁體中文標註
            - 風格簡潔、乾淨、像課堂講義或教學海報
            - 使用箭頭、流程、對照圖或分區結構來幫助理解
            - 以解釋概念為主，不要裝飾性插畫
            - 白色或暖色淺底
            - 不要浮水印
            """
        ).strip()

    def _build_quiz_prompt(self, payload: TutorQuizRequest) -> str:
        """Return a JSON-only quiz generation prompt."""

        objectives = payload.objectives or [payload.objective]
        conversation_lines = [
            f"{'學生' if message.role == 'user' else 'AI 導師'}：{message.content}"
            for message in payload.messages[-8:]
        ]
        quiz_history_summary = self._summarize_quiz_history(payload.quiz_history)
        return dedent(
            f"""
            你是一位繁體中文的中學老師，現在要根據指定的學習目標產生全新的選擇題測驗。
            你必須只輸出 JSON，不要輸出 markdown、前言或解釋文字。

            課堂主題：{payload.topic}
            目前學習目標：{payload.objective}
            全部學習目標：
            {chr(10).join(f"- {objective}" for objective in objectives)}

            最近對話：
            {chr(10).join(conversation_lines) if conversation_lines else "目前沒有額外對話內容。"}

            先前測驗紀錄：
            {quiz_history_summary}

            請生成 {payload.question_count} 題全新的選擇題，要求：
            - 全部使用繁體中文
            - 每題都要和目前學習目標直接相關
            - 每題一定要有 4 個選項
            - 每題只能有 1 個正確答案
            - 題目避免和先前測驗完全重複
            - 優先針對學生先前答錯、猶豫或對話中卡住的概念出題
            - explanation 請簡短說明為什麼答案正確，方便作答後回顯

            JSON schema:
            {{
              "title": string,
              "questions": [
                {{
                  "id": string,
                  "prompt": string,
                  "options": [
                    {{"id": "A", "text": string}},
                    {{"id": "B", "text": string}},
                    {{"id": "C", "text": string}},
                    {{"id": "D", "text": string}}
                  ],
                  "correct_option_id": "A" | "B" | "C" | "D",
                  "explanation": string
                }}
              ]
            }}
            """
        ).strip()

    def _summarize_quiz_history(self, quiz_history: list[TutorQuizHistoryItem]) -> str:
        """Return a concise summary of previous quiz attempts."""

        if not quiz_history:
            return "目前尚未生成過測驗。"

        lines: list[str] = []
        for attempt_index, attempt in enumerate(quiz_history[-3:], start=1):
            score_text = (
                f"{attempt.score}/{attempt.total_questions}"
                if attempt.score is not None and attempt.total_questions is not None
                else "尚未提交"
            )
            lines.append(f"測驗 {attempt_index}：{attempt.title}，得分 {score_text}")
            for question in attempt.questions:
                selected_text = question.selected_option_id or "未作答"
                result_text = (
                    "答對"
                    if question.is_correct is True
                    else "答錯"
                    if question.is_correct is False
                    else "未評分"
                )
                lines.append(
                    f"- 題目：{question.prompt}｜學生選擇：{selected_text}｜正確答案：{question.correct_option_id}｜結果：{result_text}"
                )

        return "\n".join(lines)

    def _from_openai(
        self, payload: TutorModeRequest, response_json: dict[str, Any]
    ) -> TutorModeResponse:
        """Convert OpenAI JSON into the API's typed response."""

        # Defensive parsing: fall back to offline plan if required keys are missing.
        required_keys = {
            "learner_profile",
            "objectives",
            "understanding",
            "concept_breakdown",
            "teaching_modalities",
            "assessment",
            "completion",
            "conversation_manager",
            "learning_stages",
        }
        if not required_keys.issubset(response_json):
            return self._offline_plan(payload)

        understanding = TutorUnderstandingPlan(**response_json["understanding"])
        concepts = [
            TutorConceptBreakdown(**concept)
            for concept in response_json.get("concept_breakdown", [])
        ]
        modalities = [
            TutorTeachingModality(**modality)
            for modality in response_json.get("teaching_modalities", [])
        ]
        assessment_payload = response_json.get("assessment", {})
        items = [
            TutorAssessmentItem(**item)
            for item in assessment_payload.get("items", [])
        ]
        assessment = TutorAssessmentPlan(**assessment_payload, items=items)
        completion = TutorCompletionPlan(**response_json.get("completion", {}))
        conversation_manager = TutorConversationManager(
            **response_json.get("conversation_manager", {})
        )
        stages = []
        for stage_payload in response_json.get("learning_stages", []):
            quiz_payload = stage_payload.get("quiz", {})
            quiz = TutorStageQuiz(**quiz_payload)
            stages.append(
                TutorLearningStage(
                    name=stage_payload.get("name", "Stage"),
                    focus=stage_payload.get("focus", ""),
                    objectives=stage_payload.get("objectives", []),
                    prerequisites=stage_payload.get("prerequisites", []),
                    pass_criteria=stage_payload.get("pass_criteria", []),
                    quiz=quiz,
                    on_success=stage_payload.get("on_success", ""),
                    on_failure=stage_payload.get("on_failure", ""),
                )
            )

        return TutorModeResponse(
            model=response_json.get("model", self.model),
            generated_at=datetime.now(timezone.utc),
            topic=payload.topic,
            learner_profile=response_json["learner_profile"],
            objectives=response_json.get("objectives", []),
            understanding=understanding,
            concept_breakdown=concepts,
            teaching_modalities=modalities,
            assessment=assessment,
            completion=completion,
            conversation_manager=conversation_manager,
            learning_stages=stages,
        )

    def _offline_chat_response(self, payload: TutorChatRequest) -> TutorChatResponse:
        """Provide a deterministic fallback chat response."""

        latest_student_message = next(
            (
                message.content
                for message in reversed(payload.messages)
                if message.role == "user"
            ),
            "",
        )
        reply = (
            f"我們先聚焦在「{payload.objective}」。"
            f"{'你剛才提到：' + latest_student_message if latest_student_message else '先用你自己的話說說你目前理解到哪裡。'}"
            " 先嘗試指出一個你已經知道的重點，再說一個你最不確定的地方，我會陪你一步一步整理。"
        )

        return TutorChatResponse(
            model=self.model,
            message=TutorChatMessage(role="assistant", content=reply),
        )

    def _from_openai_quiz(
        self, payload: TutorQuizRequest, response_json: dict[str, Any]
    ) -> TutorQuizResponse:
        """Convert OpenAI JSON into the API's typed quiz response."""

        questions_payload = response_json.get("questions")
        if not isinstance(questions_payload, list) or not questions_payload:
            return self._offline_quiz_response(
                payload,
                error="模型回傳的測驗格式不完整，已改為顯示備援題目。",
            )

        questions: list[TutorQuizQuestion] = []
        for index, question_payload in enumerate(questions_payload[: payload.question_count]):
            try:
                question = TutorQuizQuestion(**question_payload)
            except Exception:
                return self._offline_quiz_response(
                    payload,
                    error="模型回傳的題目格式不完整，已改為顯示備援題目。",
                )

            if len(question.options) != 4:
                return self._offline_quiz_response(
                    payload,
                    error="模型回傳的選項數量不正確，已改為顯示備援題目。",
                )

            option_ids = {option.id for option in question.options}
            if question.correct_option_id not in option_ids:
                return self._offline_quiz_response(
                    payload,
                    error="模型回傳的答案鍵不正確，已改為顯示備援題目。",
                )

            questions.append(
                TutorQuizQuestion(
                    id=question.id or f"q{index + 1}",
                    prompt=question.prompt,
                    options=question.options,
                    correct_option_id=question.correct_option_id,
                    explanation=question.explanation,
                )
            )

        title = response_json.get("title")
        if not isinstance(title, str) or not title.strip():
            title = f"{payload.objective} 隨堂測驗"

        return TutorQuizResponse(
            model=self.model,
            quiz_id=str(uuid4()),
            title=title.strip(),
            questions=questions,
            source="openai",
            error=None,
        )

    def _offline_quiz_response(
        self, payload: TutorQuizRequest, *, error: str | None
    ) -> TutorQuizResponse:
        """Provide a deterministic multiple-choice quiz fallback."""

        prompt_variants = [
            (
                f"以下哪一項最能對應目前的學習目標「{payload.objective}」？",
                [
                    TutorQuizOption(id="A", text=f"理解並說明：{payload.objective}"),
                    TutorQuizOption(id="B", text="只需要背誦與主題無關的名詞"),
                    TutorQuizOption(id="C", text="完全不需要理解概念之間的關係"),
                    TutorQuizOption(id="D", text="只要記住結論，不必知道原因"),
                ],
                "A",
                "這題在確認你是否抓到目前學習目標本身的重點。",
            ),
            (
                f"如果要向同學解釋「{payload.objective}」，哪一種做法最合適？",
                [
                    TutorQuizOption(id="A", text="先說出核心概念，再補充原因與例子"),
                    TutorQuizOption(id="B", text="直接背出零碎句子，不整理邏輯"),
                    TutorQuizOption(id="C", text="跳過關鍵概念，只講結果"),
                    TutorQuizOption(id="D", text="避開不懂的部分，不再確認"),
                ],
                "A",
                "先建立概念主幹，再補充細節，最能幫助理解與表達。",
            ),
            (
                "當你在這個學習目標上卡住時，下一步最合理的是什麼？",
                [
                    TutorQuizOption(id="A", text="指出自己最不確定的部分，再回到概念拆解"),
                    TutorQuizOption(id="B", text="直接猜答案，不再檢查原因"),
                    TutorQuizOption(id="C", text="只看選項長短決定答案"),
                    TutorQuizOption(id="D", text="跳到別的題目，不整理這個概念"),
                ],
                "A",
                "先找出真正卡住的點，才能讓後續導學和測驗更有效。",
            ),
            (
                f"針對「{payload.objective}」，哪一種學習方式最能驗證自己是否真的理解？",
                [
                    TutorQuizOption(id="A", text="用自己的話重述並回答情境問題"),
                    TutorQuizOption(id="B", text="只重複看同一句話，不檢查理解"),
                    TutorQuizOption(id="C", text="只記住最短的選項"),
                    TutorQuizOption(id="D", text="完全依賴別人直接告訴答案"),
                ],
                "A",
                "能夠自行重述並應用，通常比單純重讀更能檢驗理解。",
            ),
            (
                f"如果你上一輪測驗答錯了，現在重新面對「{payload.objective}」時，最好的策略是什麼？",
                [
                    TutorQuizOption(id="A", text="回頭看錯因，確認是概念錯誤還是判斷失誤"),
                    TutorQuizOption(id="B", text="不看解析，直接希望下一次運氣更好"),
                    TutorQuizOption(id="C", text="只記住正確選項字母，不理解原因"),
                    TutorQuizOption(id="D", text="避免再做類似題目"),
                ],
                "A",
                "先辨識錯因，才知道要補的是概念、步驟還是題意判讀。",
            ),
        ]

        questions = [
            TutorQuizQuestion(
                id=f"q{index + 1}",
                prompt=prompt,
                options=options,
                correct_option_id=correct_option_id,
                explanation=explanation,
            )
            for index, (prompt, options, correct_option_id, explanation) in enumerate(
                prompt_variants[: payload.question_count]
            )
        ]

        return TutorQuizResponse(
            model=self.model,
            quiz_id=str(uuid4()),
            title=f"{payload.objective} 隨堂測驗",
            questions=questions,
            source="fallback",
            error=error,
        )

    def _offline_image_data_url(self, objective: str) -> str:
        """Return a lightweight SVG fallback when image generation is unavailable."""

        safe_objective = escape(objective[:120])
        svg = f"""
        <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
          <rect width="1024" height="1024" fill="#f7f4ee"/>
          <rect x="72" y="72" width="880" height="880" rx="32" fill="#ffffff" stroke="#d9d3c7" stroke-width="4"/>
          <text x="112" y="180" fill="#6b6a63" font-size="28" font-family="Arial, sans-serif">圖像說明</text>
          <text x="112" y="260" fill="#171717" font-size="54" font-family="Arial, sans-serif">學習目標圖像說明</text>
          <foreignObject x="112" y="330" width="800" height="420">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #171717; font-size: 38px; line-height: 1.5;">
              {safe_objective}
            </div>
          </foreignObject>
          <line x1="112" y1="820" x2="912" y2="820" stroke="#171717" stroke-width="6"/>
          <circle cx="180" cy="820" r="18" fill="#171717"/>
          <circle cx="512" cy="820" r="18" fill="#171717"/>
          <circle cx="844" cy="820" r="18" fill="#171717"/>
        </svg>
        """.strip()
        encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
        return f"data:image/svg+xml;base64,{encoded}"

    def _offline_plan(self, payload: TutorModeRequest) -> TutorModeResponse:
        """Provide a deterministic plan when GPT-5 cannot be reached."""

        learner_profile = payload.student_level or "Curious learner"
        objectives = payload.goals or [
            f"Build foundational understanding of {payload.topic}",
            "Practice applying the concept in context",
        ]
        understanding = TutorUnderstandingPlan(
            approach="Start with a conversational diagnostic to gauge prior knowledge",
            diagnostic_questions=[
                f"How would you describe {payload.topic} in your own words?",
                "Which parts feel confusing or intimidating right now?",
            ],
            signals_to_watch=[
                "Confidence when answering why/how questions",
                "Ability to connect the topic to prior knowledge",
            ],
            beginner_flag_logic="Mark beginner=True when the learner struggles to define foundational vocabulary or relies on guesses.",
            follow_up_questions=[
                f"Can you share an example of using {payload.topic}?",
                "What related concepts have you studied before?",
                "Where do you feel the biggest gap is right now?",
            ],
            max_follow_up_iterations=3,
            escalation_strategy="After three probes, summarise what is known, state the provisional beginner flag, and explain the tailored path.",
        )
        concept_breakdown = [
            TutorConceptBreakdown(
                concept=payload.topic,
                llm_reasoning="Decompose the topic into digestible layers, building from fundamentals to nuanced applications.",
                subtopics=[
                    f"Core principles of {payload.topic}",
                    "Key vocabulary and definitions",
                    "Common pitfalls and misconceptions",
                ],
                real_world_connections=[
                    f"Everyday scenarios where {payload.topic} shows up",
                    "Analogies drawn from the learner's interests",
                ],
                prerequisites=["Baseline terminology", "Related prior knowledge from diagnostic"],
                mastery_checks=[
                    "Learner can outline the main steps without prompting",
                    "Learner correctly answers a why/how follow-up",
                ],
                remediation_plan="Deliver a targeted quiz, revisit prerequisite vocabulary, and co-create a new example before retrying.",
                advancement_cue="Celebrate with positive feedback and segue into the next subtopic via an applied challenge.",
            )
        ]
        modalities = [
            TutorTeachingModality(
                modality="visual",
                description="Use diagrams or flowcharts to map the relationships between subtopics.",
                resources=["Whiteboard sketches", "Infographic summarising the big picture"],
            ),
            TutorTeachingModality(
                modality="interactive",
                description="Guide the learner through a short BabyAGI-style task list they complete with you.",
                resources=["Collaborative document", "Step-by-step practice prompts"],
            ),
            TutorTeachingModality(
                modality="verbal",
                description="Offer a narrative explanation that stitches the ideas together with stories.",
                resources=["Mini lecture outline", "Real-time Q&A"],
            ),
        ]
        assessment_items = [
            TutorAssessmentItem(
                prompt=f"Explain {payload.topic} to a friend using a real-world analogy.",
                kind="reflection",
            ),
            TutorAssessmentItem(
                prompt=f"Apply {payload.topic} to solve a quick scenario provided by the mentor.",
                kind="practical",
                answer_key="Look for a structured approach and correct reasoning steps.",
            ),
        ]
        assessment = TutorAssessmentPlan(
            title=f"{payload.topic} comprehension check",
            format="Conversational debrief with quick formative quiz",
            human_in_the_loop_notes="Mentor reviews answers, probes for depth, and adapts follow-up tasks",
            items=assessment_items,
        )
        completion = TutorCompletionPlan(
            mastery_indicators=[
                "Learner explains the concept clearly and accurately",
                "Learner demonstrates transfer through a novel example",
                "Learner identifies next steps or questions without prompting",
            ],
            wrap_up_plan="Summarise key insights together and document agreed action items in the shared workspace.",
            follow_up_suggestions=[
                "Schedule a follow-up micro-assessment in 48 hours",
                "Provide curated resources aligned with preferred modalities",
            ],
        )
        conversation_manager = TutorConversationManager(
            agent_role="You are the GPT-5 manager coordinating tutor sub-agents inside this chat.",
            topic_extraction_prompt=(
                f"Let's double-check: are we focusing on {payload.topic}? If not, ask the learner to clarify the exact topic."
            ),
            level_assessment_summary=(
                "Set beginner_flag based on diagnostic signals. If False, ask follow-up questions sequentially (up to three) before committing."
            ),
            containment_strategy="Keep every clarification, assessment, and plan update inside this chat thread and narrate any agent hand-offs explicitly.",
        )
        learning_stages = [
            TutorLearningStage(
                name="Stage 1",
                focus="Foundational vocabulary and framing",
                objectives=[
                    f"Define the essential terms associated with {payload.topic}",
                    "Relate the concept to the learner's prior knowledge",
                ],
                prerequisites=["Beginner flag evaluated", "Diagnostic summary shared"],
                pass_criteria=[
                    "Learner restates the topic accurately",
                    "Learner identifies at least one real-world application",
                ],
                quiz=TutorStageQuiz(
                    prompt=f"Provide a simple scenario and ask the learner to identify how {payload.topic} applies.",
                    answer_key="Look for alignment with the key vocabulary and accurate mapping to the scenario.",
                    remediation="If incorrect, revisit the vocabulary with a new example and retry the quiz.",
                ),
                on_success="Acknowledge mastery and transition to applied practice.",
                on_failure="Loop back to the remediation plan, then re-issue the quiz before advancing.",
            ),
            TutorLearningStage(
                name="Stage 2",
                focus="Applied practice",
                objectives=[
                    "Guide the learner through a multi-step problem",
                    "Highlight decision points where misconceptions appear",
                ],
                prerequisites=["Stage 1 passed"],
                pass_criteria=[
                    "Learner solves the practice scenario with minimal scaffolding",
                    "Learner explains the reasoning behind each step",
                ],
                quiz=TutorStageQuiz(
                    prompt="Present a novel practice task and request a think-aloud solution.",
                    answer_key="Solution should include the major steps and rational justification.",
                    remediation="Break the task into micro-steps, model the first one, then have the learner continue.",
                ),
                on_success="Offer a celebratory recap and outline how the next stage will extend the concept.",
                on_failure="Return to the misconception, model a corrected approach, and retry the quiz with a similar prompt.",
            ),
            TutorLearningStage(
                name="Stage 3",
                focus="Extension and transfer",
                objectives=[
                    "Challenge the learner with an open-ended question",
                    "Encourage them to plan future practice or projects",
                ],
                prerequisites=["Stage 2 passed"],
                pass_criteria=[
                    "Learner proposes a creative application or extension",
                    "Learner self-identifies next steps or lingering questions",
                ],
                quiz=TutorStageQuiz(
                    prompt="Ask the learner to design a mini-quiz for someone else on this topic.",
                    answer_key="Should include accurate questions and expected answers that reflect deep understanding.",
                    remediation="Collaboratively draft one quiz question together, then let the learner complete the set.",
                ),
                on_success="Wrap up with the completion plan and encourage autonomy.",
                on_failure="Diagnose gaps, revisit relevant prior stages, and co-create the quiz before another attempt.",
            ),
        ]

        return TutorModeResponse(
            model=self.model,
            generated_at=datetime.now(timezone.utc),
            topic=payload.topic,
            learner_profile=learner_profile,
            objectives=objectives,
            understanding=understanding,
            concept_breakdown=concept_breakdown,
            teaching_modalities=modalities,
            assessment=assessment,
            completion=completion,
            conversation_manager=conversation_manager,
            learning_stages=learning_stages,
        )
