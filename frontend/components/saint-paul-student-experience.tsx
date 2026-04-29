"use client";

import {
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  ListChecks,
  Lock,
  SendHorizonal,
  X,
} from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";
import type {
  SaintPaulAssessmentQuestion,
  SaintPaulLesson,
} from "@/lib/saint-paul-quiz-bank";
import { cn } from "@/lib/utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type SaintPaulStudentExperienceProps = {
  lesson: SaintPaulLesson | null;
  mode: string;
  modeLabel: string;
  topicLabel: string;
};

type StudentTabId = "pre" | "tutor" | "post";
type ObjectiveStatus = "not-started" | "in-progress" | "completed";
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type TutorChatResponse = {
  model: string;
  message: {
    role: "assistant";
    content: string;
  };
};

type TutorImageExplanationResponse = {
  model: string;
  prompt: string;
  image_data_url: string;
  source: "openai" | "fallback";
  error: string | null;
};

type TutorQuizOption = {
  id: string;
  text: string;
};

type TutorQuizQuestion = {
  id: string;
  prompt: string;
  options: TutorQuizOption[];
  correct_option_id: string;
  explanation: string | null;
};

type TutorQuizHistoryItem = {
  quiz_id: string;
  title: string;
  questions: Array<
    TutorQuizQuestion & {
      selected_option_id: string | null;
      is_correct: boolean | null;
    }
  >;
  score: number | null;
  total_questions: number | null;
};

type TutorQuizResponse = {
  model: string;
  quiz_id: string;
  title: string;
  questions: TutorQuizQuestion[];
  source: "openai" | "fallback";
  error: string | null;
};

type GeneratedImageState = {
  imageDataUrl: string;
  source: "openai" | "fallback";
  error: string | null;
};

type QuizQuestionState = TutorQuizQuestion & {
  selectedOptionId: string | null;
  isCorrect: boolean | null;
};

type GeneratedQuizState = {
  quizId: string;
  title: string;
  questions: QuizQuestionState[];
  error: string | null;
  submitted: boolean;
  score: number | null;
};

type TimelineTextItem = {
  id: string;
  kind: "text";
  role: "user" | "assistant";
  content: string;
};

type TimelineThinkingItem = {
  id: string;
  kind: "thinking";
  title: string;
  detail: string;
};

type TimelineQuizItem = {
  id: string;
  kind: "quiz";
  quiz: GeneratedQuizState;
};

type TimelineImageItem = {
  id: string;
  kind: "image";
  image: GeneratedImageState;
};

type TimelineItem =
  | TimelineTextItem
  | TimelineThinkingItem
  | TimelineQuizItem
  | TimelineImageItem;

type AssessmentResponseState = Record<string, string>;

function PrimaryButton({
  children,
  className,
  ...props
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>): JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:border-[#D6D1C8] disabled:bg-[#E9E4DA] disabled:text-[#8A867E]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  className,
  ...props
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>): JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm font-medium text-[#171717] transition-colors hover:border-[#171717] hover:bg-[#FBF8F2] disabled:cursor-not-allowed disabled:border-[#E6E0D5] disabled:bg-[#F6F2EB] disabled:text-[#9A968D]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({
  status,
}: Readonly<{ status: ObjectiveStatus }>): JSX.Element {
  const label =
    status === "completed"
      ? "已完成"
      : status === "in-progress"
        ? "進行中"
        : "未開始";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        status === "completed" &&
          "border-[#B8DEC5] bg-[#E8F5EC] text-[#256C42]",
        status === "in-progress" &&
          "border-[#BCD3F6] bg-[#EAF2FF] text-[#1F5AA8]",
        status === "not-started" &&
          "border-[#E7BCB7] bg-[#FCEDEC] text-[#A43D36]",
      )}
    >
      {label}
    </span>
  );
}

function ThinkingIndicator({
  title,
  detail,
}: Readonly<{ title: string; detail: string }>): JSX.Element {
  return (
    <div className="max-w-[380px] rounded-2xl border border-[#E7E1D6] bg-white px-4 py-4 text-[#171717] shadow-[0_6px_18px_rgba(23,23,23,0.04)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#171717] animate-pulse" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#171717] animate-pulse [animation-delay:160ms]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#171717] animate-pulse [animation-delay:320ms]" />
        </div>
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#5F5D57]">{detail}</p>
    </div>
  );
}

function buildIntroMessage(objective: string): ChatMessage {
  return {
    id: `intro-${objective}`,
    role: "assistant",
    content: `我們先聚焦這個學習目標：「${objective}」。你可以先告訴我哪一部分最不確定，我會一步一步陪你整理。`,
  };
}

function buildIntroTimelineItem(objective: string): TimelineTextItem {
  const message = buildIntroMessage(objective);
  return {
    id: message.id,
    kind: "text",
    role: message.role,
    content: message.content,
  };
}

export default function SaintPaulStudentExperience({
  lesson,
  mode,
  modeLabel,
  topicLabel,
}: Readonly<SaintPaulStudentExperienceProps>): JSX.Element {
  const hasTutorStage = mode === "quiz-plus-ai-tutor";
  const objectives = lesson?.objectives ?? [];
  const preQuizTitle = lesson?.preQuizTitle ?? "前測";
  const postQuizTitle = lesson?.postQuizTitle ?? "後測";
  const preQuizQuestions = lesson?.preQuestions ?? [];
  const postQuizQuestions = lesson?.postQuestions ?? [];

  const [activeTab, setActiveTab] = useState<StudentTabId>("pre");
  const [preQuizResponses, setPreQuizResponses] =
    useState<AssessmentResponseState>({});
  const [postQuizResponses, setPostQuizResponses] =
    useState<AssessmentResponseState>({});
  const [preQuizSubmitted, setPreQuizSubmitted] = useState(false);
  const [postQuizSubmitted, setPostQuizSubmitted] = useState(false);
  const [activeObjectiveIndex, setActiveObjectiveIndex] = useState(0);
  const [objectiveStatuses, setObjectiveStatuses] = useState<ObjectiveStatus[]>(
    objectives.map(() => "not-started"),
  );
  const [messagesByObjective, setMessagesByObjective] = useState<
    Record<number, ChatMessage[]>
  >(
    Object.fromEntries(
      objectives.map((objective, index) => [
        index,
        [buildIntroMessage(objective)],
      ]),
    ),
  );
  const [timelineByObjective, setTimelineByObjective] = useState<
    Record<number, TimelineItem[]>
  >(
    Object.fromEntries(
      objectives.map((objective, index) => [
        index,
        [buildIntroTimelineItem(objective)],
      ]),
    ),
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [previewImageDataUrl, setPreviewImageDataUrl] = useState<string | null>(
    null,
  );
  const [quizByObjective, setQuizByObjective] = useState<
    Record<number, GeneratedQuizState>
  >({});
  const [quizHistoryByObjective, setQuizHistoryByObjective] = useState<
    Record<number, TutorQuizHistoryItem[]>
  >({});

  const buildQuizContext = (objectiveIndex: number): TutorQuizHistoryItem[] => {
    const quizHistory = quizHistoryByObjective[objectiveIndex] ?? [];
    const liveQuiz = quizByObjective[objectiveIndex];

    if (
      !liveQuiz ||
      quizHistory.some((quiz) => quiz.quiz_id === liveQuiz.quizId)
    ) {
      return quizHistory;
    }

    return [
      ...quizHistory,
      {
        quiz_id: liveQuiz.quizId,
        title: liveQuiz.title,
        score: liveQuiz.score,
        total_questions: liveQuiz.questions.length,
        questions: liveQuiz.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          options: question.options,
          correct_option_id: question.correct_option_id,
          explanation: question.explanation,
          selected_option_id: question.selectedOptionId,
          is_correct: question.isCorrect,
        })),
      },
    ];
  };

  const activeObjective = objectives[activeObjectiveIndex] ?? "";
  const activeMessages = messagesByObjective[activeObjectiveIndex] ?? [];
  const activeTimeline = timelineByObjective[activeObjectiveIndex] ?? [];
  const activeQuiz = quizByObjective[activeObjectiveIndex];
  const activeQuizHistory = quizHistoryByObjective[activeObjectiveIndex] ?? [];
  const activeQuizContext = buildQuizContext(activeObjectiveIndex);
  const completedObjectiveCount = objectiveStatuses.filter(
    (status) => status === "completed",
  ).length;
  const canOpenTutor = hasTutorStage && preQuizSubmitted;
  const canOpenPostQuiz =
    hasTutorStage &&
    completedObjectiveCount === objectives.length &&
    objectives.length > 0;

  const tabs = !hasTutorStage
    ? [
        {
          id: "pre" as const,
          label: "前測",
          disabled: false,
          completed: preQuizSubmitted,
        },
      ]
    : [
        {
          id: "pre" as const,
          label: "前測",
          disabled: false,
          completed: preQuizSubmitted,
        },
        {
          id: "tutor" as const,
          label: "智慧導學",
          disabled: !canOpenTutor,
          completed: false,
        },
        {
          id: "post" as const,
          label: "後測",
          disabled: !canOpenPostQuiz,
          completed: postQuizSubmitted,
        },
      ];

  const submitPreQuiz = () => {
    setPreQuizSubmitted(true);
    if (hasTutorStage) {
      setActiveTab("tutor");
    }
  };

  const submitPostQuiz = () => {
    setPostQuizSubmitted(true);
  };

  const markObjectiveCompleted = () => {
    setObjectiveStatuses((current) =>
      current.map((status, index) =>
        index === activeObjectiveIndex ? "completed" : status,
      ),
    );
    if (activeObjectiveIndex < objectives.length - 1) {
      setActiveObjectiveIndex(activeObjectiveIndex + 1);
    }
  };

  const handleTabClick = (
    tabId: StudentTabId,
    disabled: boolean,
    completed: boolean,
  ) => {
    if (disabled || completed) {
      return;
    }

    setActiveTab(tabId);
  };

  const handleAssessmentOptionSelect = (
    setResponses: Dispatch<SetStateAction<AssessmentResponseState>>,
    questionId: string,
    optionId: string,
  ) => {
    setResponses((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  };

  const handleAssessmentTextChange = (
    setResponses: Dispatch<SetStateAction<AssessmentResponseState>>,
    questionId: string,
    value: string,
  ) => {
    setResponses((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const renderAssessmentQuestion = (
    question: SaintPaulAssessmentQuestion,
    index: number,
    responses: AssessmentResponseState,
    setResponses: Dispatch<SetStateAction<AssessmentResponseState>>,
    submitted: boolean,
  ): JSX.Element => {
    const currentResponse = responses[question.id] ?? "";

    return (
      <div
        key={question.id}
        className="rounded-2xl border border-[#E7E1D6] bg-[#FCFBF8] p-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-[#171717]">
            {`第 ${index + 1} 題：${question.prompt}`}
          </p>
          <span className="inline-flex rounded-full border border-[#D8D2C7] bg-white px-3 py-1 text-xs font-medium text-[#5F5D57]">
            {question.type === "MCQ" ? "選擇題" : "簡答題"}
          </span>
        </div>

        {question.type === "MCQ" ? (
          <div className="mt-4 grid gap-2">
            {question.options.map((option) => {
              const isSelected = currentResponse === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    handleAssessmentOptionSelect(
                      setResponses,
                      question.id,
                      option.id,
                    )
                  }
                  disabled={submitted}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                    !submitted &&
                      "border-[#DDD7CC] bg-white hover:border-[#171717]",
                    !submitted &&
                      isSelected &&
                      "border-[#171717] bg-[#F7F3EC]",
                    submitted && isSelected && "border-[#171717] bg-[#F7F3EC]",
                    submitted &&
                      !isSelected &&
                      "border-[#E5DED1] bg-[#FCFBF8] text-[#5F5D57]",
                  )}
                >
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-current px-1 text-xs font-semibold">
                    {option.id}
                  </span>
                  <span className="leading-6">{option.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={currentResponse}
            onChange={(event) =>
              handleAssessmentTextChange(
                setResponses,
                question.id,
                event.target.value,
              )
            }
            disabled={submitted}
            className="mt-4 min-h-28 w-full rounded-2xl border border-[#DDD7CC] bg-white px-4 py-3 text-sm leading-6 text-[#171717] outline-none transition-colors focus:border-[#171717] disabled:bg-[#F5F1E8]"
            placeholder="請輸入你的回答"
          />
        )}

        {question.confidenceRating ? (
          <p className="mt-3 text-xs leading-6 text-[#7B776F]">
            {question.confidenceRating}
          </p>
        ) : null}
      </div>
    );
  };

  const renderAssessmentSection = (
    title: string,
    questions: SaintPaulAssessmentQuestion[],
    responses: AssessmentResponseState,
    setResponses: Dispatch<SetStateAction<AssessmentResponseState>>,
    submitted: boolean,
  ): JSX.Element => {
    if (questions.length === 0) {
      return (
        <div className="mt-6 rounded-2xl border border-dashed border-[#D7D2C8] bg-[#FCFBF8] p-5 text-sm leading-6 text-[#5F5D57]">
          目前沒有可顯示的題目。
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="rounded-2xl bg-[#F7F4EE] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6A63]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5F5D57]">
            共 {questions.length} 題。選擇題可直接點選答案，簡答題請輸入文字作答。
          </p>
        </div>
        <div className="mt-4 space-y-4">
          {questions.map((question, index) =>
            renderAssessmentQuestion(
              question,
              index,
              responses,
              setResponses,
              submitted,
            ),
          )}
        </div>
      </div>
    );
  };

  const handleSendMessage = async () => {
    const trimmed = draftMessage.trim();
    if (!trimmed || !lesson || !activeObjective) {
      return;
    }

    const objectiveIndex = activeObjectiveIndex;
    const objective = activeObjective;
    const nextActiveMessages = messagesByObjective[objectiveIndex] ?? [];
    const nextQuizContext = buildQuizContext(objectiveIndex);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const thinkingId = `thinking-chat-${Date.now()}`;
    const nextMessages = [...nextActiveMessages, userMessage];

    setDraftMessage("");
    setChatError(null);
    setQuizError(null);
    setIsSending(true);
    setMessagesByObjective((current) => ({
      ...current,
      [objectiveIndex]: nextMessages,
    }));
    setTimelineByObjective((current) => ({
      ...current,
      [objectiveIndex]: [
        ...(current[objectiveIndex] ?? []),
        {
          id: userMessage.id,
          kind: "text",
          role: userMessage.role,
          content: userMessage.content,
        },
        {
          id: thinkingId,
          kind: "thinking",
          title: "智慧導學思考中",
          detail: "正在整理你的提問，稍後會回覆更清楚的引導。",
        },
      ],
    }));
    setObjectiveStatuses((current) =>
      current.map((status, index) =>
        index === objectiveIndex && status === "not-started"
          ? "in-progress"
          : status,
      ),
    );

    try {
      const response = await fetch(`${API_BASE}/tutor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: lesson.topic,
          objective,
          objectives,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          quiz_history: nextQuizContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Tutor chat request failed");
      }

      const payload = (await response.json()) as TutorChatResponse;
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: payload.message.content,
      };

      setMessagesByObjective((current) => ({
        ...current,
        [objectiveIndex]: [...nextMessages, assistantMessage],
      }));
      setTimelineByObjective((current) => ({
        ...current,
        [objectiveIndex]: (current[objectiveIndex] ?? []).map((item) =>
          item.id === thinkingId
            ? {
                id: assistantMessage.id,
                kind: "text",
                role: assistantMessage.role,
                content: assistantMessage.content,
              }
            : item,
        ),
      }));
    } catch (error) {
      console.error(error);
      setChatError("目前無法連接智慧導學，請稍後再試。");
      setTimelineByObjective((current) => ({
        ...current,
        [objectiveIndex]: (current[objectiveIndex] ?? []).filter(
          (item) => item.id !== thinkingId,
        ),
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!lesson || !activeObjective) {
      return;
    }

    const objectiveIndex = activeObjectiveIndex;
    const objective = activeObjective;
    const nextActiveMessages = messagesByObjective[objectiveIndex] ?? [];
    const nextQuizContext = buildQuizContext(objectiveIndex);
    setChatError(null);
    setQuizError(null);
    setIsGeneratingImage(true);
    const thinkingId = `thinking-image-${Date.now()}`;
    setTimelineByObjective((current) => ({
      ...current,
      [objectiveIndex]: [
        ...(current[objectiveIndex] ?? []),
        {
          id: thinkingId,
          kind: "thinking",
          title: "正在生成圖像說明",
          detail: "這通常會比一般回覆多花一點時間，請稍候。",
        },
      ],
    }));

    try {
      const response = await fetch(`${API_BASE}/tutor/image-explanation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: lesson.topic,
          objective,
          objectives,
          messages: nextActiveMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          quiz_history: nextQuizContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Tutor image request failed");
      }

      const payload = (await response.json()) as TutorImageExplanationResponse;
      const imageState: GeneratedImageState = {
        imageDataUrl: payload.image_data_url,
        source: payload.source,
        error: payload.error,
      };
      setTimelineByObjective((current) => ({
        ...current,
        [objectiveIndex]: (current[objectiveIndex] ?? []).map((item) =>
          item.id === thinkingId
            ? {
                id: `image-${Date.now()}`,
                kind: "image",
                image: imageState,
              }
            : item,
        ),
      }));
      setObjectiveStatuses((current) =>
        current.map((status, index) =>
          index === objectiveIndex && status === "not-started"
            ? "in-progress"
            : status,
        ),
      );
    } catch (error) {
      console.error(error);
      setChatError("目前無法生成圖像說明，請稍後再試。");
      setTimelineByObjective((current) => ({
        ...current,
        [objectiveIndex]: (current[objectiveIndex] ?? []).filter(
          (item) => item.id !== thinkingId,
        ),
      }));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!lesson || !activeObjective) {
      return;
    }

    const objectiveIndex = activeObjectiveIndex;
    const objective = activeObjective;
    const nextActiveMessages = messagesByObjective[objectiveIndex] ?? [];
    const nextQuizContext = buildQuizContext(objectiveIndex);
    setChatError(null);
    setQuizError(null);
    setIsGeneratingQuiz(true);
    const thinkingId = `thinking-quiz-${Date.now()}`;
    setTimelineByObjective((current) => ({
      ...current,
      [objectiveIndex]: [
        ...(current[objectiveIndex] ?? []),
        {
          id: thinkingId,
          kind: "thinking",
          title: "正在準備練習題",
          detail: "系統正在根據目前對話內容整理一題新的練習。",
        },
      ],
    }));

    try {
      const response = await fetch(`${API_BASE}/tutor/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: lesson.topic,
          objective,
          objectives,
          messages: nextActiveMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          quiz_history: nextQuizContext,
          question_count: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Tutor quiz request failed");
      }

      const payload = (await response.json()) as TutorQuizResponse;
      const quizState: GeneratedQuizState = {
        quizId: payload.quiz_id,
        title: payload.title,
        error: payload.error,
        submitted: false,
        score: null,
        questions: payload.questions.map((question) => ({
          ...question,
          selectedOptionId: null,
          isCorrect: null,
        })),
      };
      setQuizByObjective((current) => ({
        ...current,
        [objectiveIndex]: quizState,
      }));
      setTimelineByObjective((current) => ({
        ...current,
        [objectiveIndex]: (current[objectiveIndex] ?? []).map((item) =>
          item.id === thinkingId
            ? {
                id: `quiz-${payload.quiz_id}`,
                kind: "quiz",
                quiz: quizState,
              }
            : item,
        ),
      }));
      setObjectiveStatuses((current) =>
        current.map((status, index) =>
          index === objectiveIndex && status === "not-started"
            ? "in-progress"
            : status,
        ),
      );
    } catch (error) {
      console.error(error);
      setQuizError("目前無法生成新的測驗，請稍後再試。");
      setTimelineByObjective((current) => ({
        ...current,
        [objectiveIndex]: (current[objectiveIndex] ?? []).filter(
          (item) => item.id !== thinkingId,
        ),
      }));
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const renderPracticeCard = (quiz: GeneratedQuizState): JSX.Element => {
    return (
      <div className="max-w-[92%] rounded-2xl border border-[#E7E1D6] bg-white px-4 py-4 text-sm text-[#171717]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6A63]">
          即時練習
        </p>

        {quiz.questions.map((question, index) => (
          <div key={question.id} className={index === 0 ? "mt-3" : "mt-5"}>
            <p className="text-sm font-medium leading-7 text-[#171717]">
              {`第 ${index + 1} 題：${question.prompt}`}
            </p>

            <div className="mt-3 grid gap-2">
              {question.options.map((option) => {
                const isSelected = question.selectedOptionId === option.id;
                const isCorrectOption =
                  option.id === question.correct_option_id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleSelectQuizOption(
                        quiz.quizId,
                        question.id,
                        option.id,
                      )
                    }
                    disabled={quiz.submitted}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                      !quiz.submitted &&
                        "border-[#DDD7CC] bg-[#FCFBF8] hover:border-[#171717]",
                      !quiz.submitted &&
                        isSelected &&
                        "border-[#171717] bg-[#F7F3EC]",
                      quiz.submitted &&
                        isCorrectOption &&
                        "border-[#B8DEC5] bg-[#E8F5EC] text-[#256C42]",
                      quiz.submitted &&
                        isSelected &&
                        !isCorrectOption &&
                        "border-[#E7BCB7] bg-[#FCEDEC] text-[#A43D36]",
                      quiz.submitted &&
                        !isSelected &&
                        !isCorrectOption &&
                        "border-[#E5DED1] bg-[#FCFBF8] text-[#5F5D57]",
                    )}
                  >
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-current px-1 text-xs font-semibold">
                      {option.id}
                    </span>
                    <span className="leading-6">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {quiz.submitted ? (
              <div className="mt-3 rounded-2xl bg-[#FCFBF8] px-4 py-3 text-sm leading-6 text-[#5F5D57]">
                <p
                  className={cn(
                    "font-medium",
                    question.isCorrect ? "text-[#256C42]" : "text-[#A43D36]",
                  )}
                >
                  {question.isCorrect
                    ? "答對了。"
                    : `答錯了，正確答案是 ${question.correct_option_id}。`}
                </p>
                {question.explanation ? (
                  <p className="mt-1">{question.explanation}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}

        <div className="mt-4 text-sm leading-6 text-[#5F5D57]">
          <p>這題不計分，只用來幫你確認目前理解。</p>
          {quiz.error ? (
            <p className="mt-1 text-[#8A6512]">{quiz.error}</p>
          ) : null}
        </div>
      </div>
    );
  };

  const handleSelectQuizOption = (
    quizId: string,
    questionId: string,
    optionId: string,
  ): void => {
    const objectiveIndex = activeObjectiveIndex;
    const timeline = timelineByObjective[objectiveIndex] ?? [];
    const targetTimelineItem = timeline.find(
      (item): item is TimelineQuizItem =>
        item.kind === "quiz" && item.quiz.quizId === quizId,
    );
    const targetQuiz = targetTimelineItem?.quiz;

    if (!targetQuiz || targetQuiz.submitted) {
      return;
    }

    const gradedQuestions = targetQuiz.questions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            selectedOptionId: optionId,
            isCorrect: optionId === question.correct_option_id,
          }
        : question,
    );
    const score = gradedQuestions.filter(
      (question) => question.isCorrect,
    ).length;
    const nextQuizState: GeneratedQuizState = {
      ...targetQuiz,
      submitted: true,
      score,
      questions: gradedQuestions,
    };

    setTimelineByObjective((current) => ({
      ...current,
      [objectiveIndex]: (current[objectiveIndex] ?? []).map((item) =>
        item.kind === "quiz" && item.quiz.quizId === quizId
          ? {
              ...item,
              quiz: nextQuizState,
            }
          : item,
      ),
    }));
    setQuizByObjective((current) => {
      const active = current[objectiveIndex];
      if (!active || active.quizId !== quizId || active.submitted) {
        return current;
      }

      return {
        ...current,
        [objectiveIndex]: nextQuizState,
      };
    });
    setQuizHistoryByObjective((historyCurrent) => ({
      ...historyCurrent,
      [objectiveIndex]: [
        ...(historyCurrent[objectiveIndex] ?? []),
        {
          quiz_id: nextQuizState.quizId,
          title: nextQuizState.title,
          score,
          total_questions: nextQuizState.questions.length,
          questions: nextQuizState.questions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            options: question.options,
            correct_option_id: question.correct_option_id,
            explanation: question.explanation,
            selected_option_id: question.selectedOptionId,
            is_correct: question.isCorrect,
          })),
        },
      ],
    }));
    setObjectiveStatuses((current) =>
      current.map((status, index) =>
        index === objectiveIndex && status === "not-started"
          ? "in-progress"
          : status,
      ),
    );
  };

  const renderImageCard = (image: GeneratedImageState): JSX.Element => {
    const isModelGenerated = image.source === "openai";

    return (
      <div className="max-w-[440px] overflow-hidden rounded-2xl border border-[#E7E1D6] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#E7E1D6] px-4 py-3">
          <p className="text-sm font-medium text-[#171717]">圖像說明</p>
          <span
            className={cn(
              "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
              isModelGenerated
                ? "border-[#B8DEC5] bg-[#E8F5EC] text-[#256C42]"
                : "border-[#E8D39B] bg-[#FBF2D7] text-[#8D6513]",
            )}
          >
            {isModelGenerated ? "模型生成" : "備援圖示"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPreviewImageDataUrl(image.imageDataUrl)}
          className="block w-full overflow-hidden bg-[#FCFBF8] text-left"
        >
          <img
            src={image.imageDataUrl}
            alt={`${activeObjective} 圖像說明`}
            draggable={false}
            className="pointer-events-none h-56 w-full select-none object-cover object-top"
          />
          <p className="border-t border-[#E7E1D6] px-4 py-3 text-xs leading-6 text-[#5F5D57]">
            點擊查看較大預覽
          </p>
        </button>
        {!isModelGenerated && image.error ? (
          <p className="border-t border-[#E7E1D6] px-4 py-3 text-xs leading-6 text-[#8A6512]">
            目前顯示的是備援圖示，原因：{image.error}
          </p>
        ) : null}
      </div>
    );
  };

  const renderTimelineItem = (item: TimelineItem): JSX.Element => {
    switch (item.kind) {
      case "text":
        return (
          <div
            className={cn(
              "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-7 md:max-w-[82%]",
              item.role === "assistant"
                ? "bg-white text-[#171717]"
                : "ml-auto bg-[#171717] text-white",
            )}
          >
            {item.content}
          </div>
        );
      case "thinking":
        return <ThinkingIndicator title={item.title} detail={item.detail} />;
      case "quiz":
        return renderPracticeCard(item.quiz);
      case "image":
        return renderImageCard(item.image);
      default:
        return <></>;
    }
  };

  if (!lesson) {
    return (
      <main className="saint-paul-shell min-h-screen bg-[#F6F2EB] text-[#171717]">
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
          <section className="rounded-[28px] border border-dashed border-[#D7D2C8] bg-white p-8 text-center shadow-[0_8px_24px_rgba(23,23,23,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
              聖保祿學生頁面
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              找不到對應課程
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#5F5D57]">
              這條分享連結沒有對應到可顯示的內容，請回到老師頁面重新產生連結。
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="saint-paul-shell min-h-screen bg-[#F6F2EB] text-[#171717]">
      <header className="border-b border-[#E4DED2] bg-[#FBF8F2]">
        <div className="mx-auto flex max-w-[1600px] justify-center px-6 py-5 md:px-10">
          <div
            className="flex flex-wrap justify-center gap-3"
            role="tablist"
            aria-label="學習流程"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-disabled={tab.disabled || tab.completed}
                onClick={() =>
                  handleTabClick(tab.id, tab.disabled, tab.completed)
                }
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#D8D2C7] bg-white text-[#171717]",
                  (tab.disabled || tab.completed) &&
                    "cursor-not-allowed border-[#E1DCCF] bg-[#F3EFE7] text-[#9A968D]",
                )}
              >
                <span>{tab.label}</span>
                {tab.completed ? (
                  <Check className="h-4 w-4" strokeWidth={1.8} />
                ) : tab.disabled && index > 0 ? (
                  <Lock className="h-4 w-4" strokeWidth={1.8} />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div
        className={cn(
          "mx-auto max-w-[1600px] px-6 md:px-10",
          activeTab === "tutor"
            ? "h-[calc(100dvh-96px)] overflow-hidden py-6"
            : "py-8 md:py-10",
        )}
      >
        {activeTab === "pre" ? (
          <section className="rounded-[28px] border border-[#DDD7CC] bg-white p-6 shadow-[0_8px_24px_rgba(23,23,23,0.04)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
              {hasTutorStage ? "前測階段" : "測驗階段"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
              {hasTutorStage ? "前測" : "測驗"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5D57]">
              請先完成題庫中的前測題目。提交後，此步驟會鎖定，並依序進入下一個階段。
            </p>
            {renderAssessmentSection(
              preQuizTitle,
              preQuizQuestions,
              preQuizResponses,
              setPreQuizResponses,
              preQuizSubmitted,
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE9DF] pt-5">
              <p className="text-sm leading-6 text-[#5F5D57]">
                {preQuizSubmitted
                  ? "前測已提交，這一階段已鎖定。"
                  : hasTutorStage
                    ? "提交後會解鎖智慧導學。"
                    : "提交後此測驗會鎖定。"}
              </p>

              <PrimaryButton
                onClick={submitPreQuiz}
                disabled={preQuizSubmitted}
              >
                {preQuizSubmitted ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={1.8} />
                    已提交
                  </>
                ) : (
                  <>
                    提交測驗
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </>
                )}
              </PrimaryButton>
            </div>
          </section>
        ) : null}

        {activeTab === "tutor" ? (
          <section className="grid h-full min-h-0 items-stretch gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="min-h-0 overflow-y-auto rounded-[28px] border border-[#DDD7CC] bg-white p-5 shadow-[0_8px_24px_rgba(23,23,23,0.04)] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
                學習目標列表
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
                學習目標
              </h2>
              <div className="mt-4 rounded-2xl border border-[#F1D28A] bg-[#FFF4D6] px-4 py-4 text-sm leading-6 text-[#8A6512] shadow-[0_6px_18px_rgba(241,210,138,0.22)]">
                <p className="font-medium text-[#8A6512]">
                  請依序完成每個學習目標。
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {objectives.map((objective, index) => {
                  const status = objectiveStatuses[index];
                  return (
                    <button
                      key={objective}
                      type="button"
                      onClick={() => setActiveObjectiveIndex(index)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-4 text-left transition-colors",
                        index === activeObjectiveIndex
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-[#E2DCCE] bg-[#FCFBF8] text-[#171717] hover:border-[#171717]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={cn(
                              "text-xs uppercase tracking-[0.18em]",
                              index === activeObjectiveIndex
                                ? "text-white/70"
                                : "text-[#7B776F]",
                            )}
                          >
                            {`學習目標 ${index + 1}`}
                          </p>
                          <p className="mt-2 text-sm leading-6">{objective}</p>
                        </div>
                        <StatusPill status={status} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#DDD7CC] bg-white p-5 shadow-[0_8px_24px_rgba(23,23,23,0.04)] md:p-6">
              <div className="flex flex-col gap-3 border-b border-[#EEE9DF] pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#171717]">
                    {activeObjective}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[#5F5D57]">
                    {topicLabel}．已完成 {completedObjectiveCount} /{" "}
                    {objectives.length} 個學習目標．已生成{" "}
                    {activeQuizHistory.length} 題練習題
                  </p>
                </div>
                <StatusPill
                  status={
                    objectiveStatuses[activeObjectiveIndex] ?? "not-started"
                  }
                />
              </div>

              <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#E7E1D6] bg-[#FCFBF8]">
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 pb-36 md:px-6 md:py-6">
                    {activeTimeline.map((item) => (
                      <div key={item.id}>{renderTimelineItem(item)}</div>
                    ))}
                  </div>

                  <div className="sticky bottom-0 z-10 border-t border-[#E9E3D8] bg-[linear-gradient(180deg,rgba(252,251,248,0.78)_0%,rgba(252,251,248,0.96)_24%,rgba(252,251,248,1)_100%)] px-4 py-4 backdrop-blur md:px-6">
                    {chatError ? (
                      <p className="mb-3 text-sm text-[#B42318]">{chatError}</p>
                    ) : null}
                    {quizError ? (
                      <p className="mb-3 text-sm text-[#B42318]">{quizError}</p>
                    ) : null}

                    <div className="rounded-[24px] border border-[#DDD7CC] bg-white p-3 shadow-[0_6px_18px_rgba(23,23,23,0.04)] md:p-4">
                      <textarea
                        value={draftMessage}
                        onChange={(event) =>
                          setDraftMessage(event.target.value)
                        }
                        className="min-h-24 w-full resize-none rounded-2xl border border-[#DDD7CC] bg-[#FCFBF8] px-4 py-3 text-sm leading-6 text-[#171717] outline-none transition-colors focus:border-[#171717]"
                        placeholder="輸入你想詢問智慧導學的問題"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <PrimaryButton
                          onClick={handleSendMessage}
                          disabled={
                            isSending || draftMessage.trim().length === 0
                          }
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              發送中
                            </>
                          ) : (
                            <>
                              <SendHorizonal
                                className="h-4 w-4"
                                strokeWidth={1.8}
                              />
                              發送問題
                            </>
                          )}
                        </PrimaryButton>

                        <SecondaryButton
                          onClick={handleGenerateQuiz}
                          disabled={isGeneratingQuiz}
                        >
                          {isGeneratingQuiz ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              生成中
                            </>
                          ) : (
                            <>
                              <ListChecks
                                className="h-4 w-4"
                                strokeWidth={1.8}
                              />
                              出一題練習
                            </>
                          )}
                        </SecondaryButton>

                        <SecondaryButton
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              生成中，這可能會稍微花一點時間，請耐心等候
                            </>
                          ) : (
                            <>
                              <ImagePlus
                                className="h-4 w-4"
                                strokeWidth={1.8}
                              />
                              生成圖像說明
                            </>
                          )}
                        </SecondaryButton>

                        <button
                          type="button"
                          onClick={markObjectiveCompleted}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C97D10] bg-[#F59E0B] px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_18px_rgba(245,158,11,0.24)] transition-colors hover:border-[#A86508] hover:bg-[#D88908]"
                        >
                          <Check className="h-4 w-4" strokeWidth={1.8} />
                          標記此目標完成
                        </button>

                        <SecondaryButton
                          onClick={() => setActiveTab("post")}
                          disabled={!canOpenPostQuiz}
                        >
                          前往後測
                        </SecondaryButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        ) : null}

        {activeTab === "post" ? (
          <section className="rounded-[28px] border border-[#DDD7CC] bg-white p-6 shadow-[0_8px_24px_rgba(23,23,23,0.04)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
              後測階段
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
              後測
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5D57]">
              完成智慧導學後，請作答後測題目。提交後此測驗會鎖定。
            </p>
            {renderAssessmentSection(
              postQuizTitle,
              postQuizQuestions,
              postQuizResponses,
              setPostQuizResponses,
              postQuizSubmitted,
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE9DF] pt-5">
              <p className="text-sm leading-6 text-[#5F5D57]">
                {postQuizSubmitted
                  ? "後測已提交，這一階段已鎖定。"
                  : "提交後將無法返回前面的測驗流程。"}
              </p>

              <PrimaryButton
                onClick={submitPostQuiz}
                disabled={postQuizSubmitted}
              >
                {postQuizSubmitted ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={1.8} />
                    已提交
                  </>
                ) : (
                  <>
                    提交後測
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </>
                )}
              </PrimaryButton>
            </div>
          </section>
        ) : null}
      </div>

      {previewImageDataUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/65 p-6 backdrop-blur-sm">
          <button
            type="button"
            aria-label="關閉圖像預覽"
            onClick={() => setPreviewImageDataUrl(null)}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="關閉圖像預覽"
            onClick={() => setPreviewImageDataUrl(null)}
            className="absolute inset-0"
          />

          <div className="relative z-10 max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between border-b border-[#E7E1D6] px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[#171717]">圖像預覽</p>
                <p className="mt-1 text-xs leading-6 text-[#5F5D57]">
                  {activeObjective}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageDataUrl(null)}
                className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C7] px-3 py-2 text-sm text-[#171717] transition-colors hover:border-[#171717] hover:bg-[#FBF8F2]"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
                關閉
              </button>
            </div>

            <div className="max-h-[calc(88vh-82px)] overflow-auto bg-[#FCFBF8] p-4 md:p-6">
              <img
                src={previewImageDataUrl}
                alt={`${activeObjective} 大圖預覽`}
                draggable={false}
                className="mx-auto h-auto max-h-[72vh] w-auto max-w-full select-none rounded-2xl border border-[#E7E1D6] bg-white"
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
