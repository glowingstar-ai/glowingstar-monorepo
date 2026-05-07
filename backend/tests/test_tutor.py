import pytest
import httpx
from fastapi.testclient import TestClient

from app.api.dependencies import _get_tutor_service
from app.core.config import get_settings
from app.main import app


@pytest.fixture(autouse=True)
def force_offline_tutor_mode(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("OPENAI_API_KEY", "")
    get_settings.cache_clear()
    _get_tutor_service.cache_clear()
    yield
    get_settings.cache_clear()
    _get_tutor_service.cache_clear()


def test_tutor_mode_offline_plan_structure() -> None:
    """Tutor mode returns a rich plan even without an OpenAI API key."""

    payload = {
        "topic": "Neural Networks",
        "student_level": "Beginner programmer transitioning into ML",
        "goals": ["Understand core building blocks", "Implement a simple network"],
        "preferred_modalities": ["visual", "interactive"],
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/tutor/mode", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["model"] == "gpt-5.5"
    assert data["topic"] == payload["topic"]
    assert data["learner_profile"]
    assert data["objectives"]

    understanding = data["understanding"]
    assert understanding["diagnostic_questions"], "Expected diagnostic questions in plan"

    concepts = data["concept_breakdown"]
    assert isinstance(concepts, list) and len(concepts) >= 1
    assert concepts[0]["llm_reasoning"]

    modalities = data["teaching_modalities"]
    assert {modality["modality"] for modality in modalities} >= {"visual", "interactive", "verbal"}

    assessment = data["assessment"]
    assert assessment["human_in_the_loop_notes"]
    assert any(item["kind"] == "practical" for item in assessment["items"])

    completion = data["completion"]
    assert completion["mastery_indicators"]
    assert completion["follow_up_suggestions"]


def test_student_tutor_chat_offline_reply() -> None:
    payload = {
        "topic": "文藝復興",
        "objective": "分析文藝復興的歷史背景。",
        "objectives": [
            "分析文藝復興的歷史背景。",
            "掌握文藝復興時期的主要作品及其內涵。",
        ],
        "messages": [
            {"role": "user", "content": "我不太懂為什麼文藝復興會在義大利開始。"}
        ],
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/tutor/chat", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["model"] == "gpt-5.5"
    assert data["message"]["role"] == "assistant"
    assert "分析文藝復興的歷史背景" in data["message"]["content"]


def test_student_tutor_chat_accepts_reference_image_url() -> None:
    payload = {
        "topic": "交通運輸",
        "objective": "分析交通運輸布局如何影響區域發展。",
        "objectives": [
            "分析交通運輸布局如何影響區域發展。",
        ],
        "messages": [
            {"role": "user", "content": "請根據這張圖幫我說明重點。"}
        ],
        "reference_image_url": "https://example.com/teaching-image.png",
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/tutor/chat", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["model"] == "gpt-5.5"
    assert data["message"]["role"] == "assistant"


def test_student_tutor_chat_retries_only_for_invalid_image_errors() -> None:
    service = _get_tutor_service()
    request = httpx.Request("POST", "https://api.openai.com/v1/responses")

    retryable_response = httpx.Response(
        400,
        json={
            "error": {
                "message": "The image data you provided does not represent a valid image.",
            }
        },
        request=request,
    )
    non_retryable_response = httpx.Response(
        400,
        json={
            "error": {
                "message": "Unsupported parameter: text.verbosity",
            }
        },
        request=request,
    )

    assert service._should_retry_chat_without_image(
        retryable_response, "https://example.com/image.png"
    )
    assert not service._should_retry_chat_without_image(
        non_retryable_response, "https://example.com/image.png"
    )
    assert not service._should_retry_chat_without_image(retryable_response, None)


def test_student_tutor_image_explanation_offline_fallback() -> None:
    payload = {
        "topic": "文藝復興",
        "objective": "分析文藝復興的歷史背景。",
        "objectives": [
            "分析文藝復興的歷史背景。",
            "掌握文藝復興時期的主要作品及其內涵。",
        ],
        "messages": [
            {"role": "user", "content": "我想知道這個時代為什麼會出現在義大利。"}
        ],
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/tutor/image-explanation", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["model"] == "gpt-image-2"
    assert data["prompt"]
    assert data["image_data_url"].startswith("data:image/")
    assert data["source"] in {"openai", "fallback"}
    if data["source"] == "fallback":
        assert data["error"]


def test_student_tutor_quiz_offline_fallback() -> None:
    payload = {
        "topic": "文藝復興",
        "objective": "分析文藝復興的歷史背景。",
        "objectives": [
            "分析文藝復興的歷史背景。",
            "掌握文藝復興時期的主要作品及其內涵。",
        ],
        "messages": [
            {"role": "assistant", "content": "我們先整理義大利城邦的背景。"},
            {"role": "user", "content": "我還是不太確定商業發展和文藝復興有什麼關係。"},
        ],
        "quiz_history": [
            {
                "quiz_id": "quiz-old",
                "title": "歷史背景檢查",
                "questions": [
                    {
                        "id": "q1",
                        "prompt": "哪一個因素最能支持文藝復興在義大利發展？",
                        "options": [
                            {"id": "A", "text": "城邦商業繁榮"},
                            {"id": "B", "text": "工業革命"},
                            {"id": "C", "text": "冷戰局勢"},
                            {"id": "D", "text": "資訊科技產業"},
                        ],
                        "correct_option_id": "A",
                        "selected_option_id": "B",
                        "is_correct": False,
                        "explanation": "商業繁榮促成資金與文化交流。",
                    }
                ],
                "score": 0,
                "total_questions": 1,
            }
        ],
        "question_count": 3,
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/tutor/quiz", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["model"] == "gpt-5.5"
    assert data["quiz_id"]
    assert data["title"]
    assert len(data["questions"]) == 3
    assert data["source"] in {"openai", "fallback"}

    first_question = data["questions"][0]
    assert first_question["prompt"]
    assert len(first_question["options"]) == 4
    assert first_question["correct_option_id"] in {"A", "B", "C", "D"}
