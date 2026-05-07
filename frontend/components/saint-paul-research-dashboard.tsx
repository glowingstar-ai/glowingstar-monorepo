"use client";

import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  Clock3,
  ExternalLink,
  ImageIcon,
  ListRestart,
  Loader2,
  MessageSquareText,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

import teachingObjectives from "@/data/saintpaul/teaching_objectives.json";
import WorkspaceBanner from "@/components/workspace-banner";
import { Button } from "@/components/ui/button";
import {
  GRADE_LABELS,
  getLabel,
  MODE_OPTIONS,
  SUBJECT_LABELS,
  type TeachingObjectivesData,
  VERSION_LABELS,
} from "@/lib/saint-paul";
import { cn } from "@/lib/utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type SaintPaulResearchSessionSummary = {
  session_id: string;
  student_id?: string | null;
  subject?: string | null;
  version?: string | null;
  grade?: string | null;
  mode?: string | null;
  topic?: string | null;
  objectives: string[];
  current_tab?: string | null;
  active_objective_index?: number | null;
  objective_statuses: string[];
  lesson_instruction_acknowledged: boolean;
  pre_quiz_submitted: boolean;
  post_quiz_submitted: boolean;
  assessment_count: number;
  message_count: number;
  artifact_count: number;
  event_count: number;
  error_count: number;
  started_at?: string | null;
  last_seen_at?: string | null;
  completed_at?: string | null;
};

type SaintPaulResearchStudentSummary = {
  student_id: string;
  session_count: number;
  last_seen_at?: string | null;
  sessions: SaintPaulResearchSessionSummary[];
};

type SaintPaulResearchOverviewResponse = {
  persistence_enabled: boolean;
  generated_at: string;
  session_count: number;
  students: SaintPaulResearchStudentSummary[];
};

type SaintPaulResearchAssessmentRecord = {
  item_key: string;
  assessment_type: string;
  student_id?: string | null;
  responses: Record<string, Record<string, unknown>>;
  submitted_at?: string | null;
};

type SaintPaulResearchMessageRecord = {
  item_key: string;
  student_id?: string | null;
  objective_index?: number | null;
  message_id?: string | null;
  role?: string | null;
  content?: string | null;
  model?: string | null;
  created_at?: string | null;
};

type SaintPaulResearchEventRecord = {
  item_key: string;
  event_id?: string | null;
  student_id?: string | null;
  event_type?: string | null;
  tab?: string | null;
  objective_index?: number | null;
  client_timestamp?: string | null;
  recorded_at?: string | null;
  payload: Record<string, unknown>;
};

type SaintPaulResearchErrorRecord = {
  item_key: string;
  error_id?: string | null;
  student_id?: string | null;
  stage?: string | null;
  error_scope?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  raw_error?: string | null;
  tab?: string | null;
  objective_index?: number | null;
  request_id?: string | null;
  metadata: Record<string, unknown>;
  recorded_at?: string | null;
};

type SaintPaulResearchArtifactRecord = {
  item_key: string;
  item_type: string;
  student_id?: string | null;
  objective_index?: number | null;
  quiz_id?: string | null;
  title?: string | null;
  score?: number | null;
  total_questions?: number | null;
  error?: string | null;
  questions: Record<string, unknown>[];
  prompt?: string | null;
  source?: string | null;
  asset_bucket?: string | null;
  asset_key?: string | null;
  asset_url?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  created_at?: string | null;
  submitted_at?: string | null;
};

type SaintPaulResearchSessionDetailResponse = {
  persistence_enabled: boolean;
  generated_at: string;
  session?: SaintPaulResearchSessionSummary | null;
  pre_assessment?: SaintPaulResearchAssessmentRecord | null;
  post_assessment?: SaintPaulResearchAssessmentRecord | null;
  messages: SaintPaulResearchMessageRecord[];
  events: SaintPaulResearchEventRecord[];
  errors: SaintPaulResearchErrorRecord[];
  generated_quizzes: SaintPaulResearchArtifactRecord[];
  quiz_attempts: SaintPaulResearchArtifactRecord[];
  generated_images: SaintPaulResearchArtifactRecord[];
};

type SaintPaulResearchTimelineItem = {
  id: string;
  kind: "assessment" | "message" | "event" | "artifact" | "error";
  timestamp: string | null;
  sortTime: number;
  title: string;
  summary: string;
  tone: "slate" | "emerald" | "amber" | "rose" | "sky";
  label: string;
  objectiveIndex?: number | null;
  metadata?: string[];
  payloadText?: string | null;
  imageUrl?: string | null;
};

type SaintPaulTutorActivityItem = {
  id: string;
  kind: "message" | "generated_quiz" | "quiz_attempt" | "generated_image";
  timestamp: string | null;
  sortTime: number;
  objectiveIndex?: number | null;
  role?: string | null;
  content?: string | null;
  model?: string | null;
  title?: string | null;
  source?: string | null;
  score?: number | null;
  totalQuestions?: number | null;
  prompt?: string | null;
  imageUrl?: string | null;
  questions?: Record<string, unknown>[];
};

type SaintPaulTutorQuizOption = {
  id: string;
  text: string;
};

type SaintPaulTutorQuizQuestion = {
  id: string;
  prompt: string;
  options: SaintPaulTutorQuizOption[];
  correctOptionId: string | null;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  explanation: string | null;
};

type SaintPaulDropdownCombination = {
  key: string;
  subject: string;
  version: string;
  grade: string;
  mode: string;
  subjectLabel: string;
  versionLabel: string;
  gradeLabel: string;
  modeLabel: string;
};

type DashboardViewMode = "table" | "details";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const SAINT_PAUL_DROPDOWN_COMBINATIONS = Object.entries(
  teachingObjectives as TeachingObjectivesData,
).flatMap(([subject, versions]) =>
  Object.entries(versions).flatMap(([version, grades]) =>
    Object.keys(grades).flatMap((grade) =>
      MODE_OPTIONS.map((modeOption) => ({
        key: [subject, version, grade, modeOption.value].join("::"),
        subject,
        version,
        grade,
        mode: modeOption.value,
        subjectLabel: getLabel(subject, SUBJECT_LABELS),
        versionLabel: getLabel(version, VERSION_LABELS),
        gradeLabel: getLabel(grade, GRADE_LABELS),
        modeLabel: modeOption.label,
      })),
    ),
  ),
) satisfies SaintPaulDropdownCombination[];

function formatDateTime(value?: string | null) {
  if (!value) return "No timestamp";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMATTER.format(date);
}

function formatShortDate(value?: string | null) {
  if (!value) return "No activity";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat().format(value);
}

function toSortableTime(value?: string | null) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getTime();
}

function stringifyCompact(value: unknown) {
  if (
    value == null ||
    (typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0)
  ) {
    return null;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatEventTypeLabel(value?: string | null) {
  if (!value) return "event";
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function parseTutorQuizQuestions(
  questions?: Record<string, unknown>[],
): SaintPaulTutorQuizQuestion[] {
  if (!questions?.length) {
    return [];
  }

  return questions
    .map((question, index) => {
      const questionRecord = asRecord(question);
      if (!questionRecord) {
        return null;
      }

      const options = Array.isArray(questionRecord.options)
        ? questionRecord.options
            .map((option, optionIndex) => {
              const optionRecord = asRecord(option);
              if (!optionRecord) {
                return null;
              }

              return {
                id: asString(optionRecord.id) ?? `option-${optionIndex + 1}`,
                text: asString(optionRecord.text) ?? "Untitled option",
              };
            })
            .filter((option): option is SaintPaulTutorQuizOption => option !== null)
        : [];

      return {
        id: asString(questionRecord.id) ?? `question-${index + 1}`,
        prompt: asString(questionRecord.prompt) ?? "Untitled question",
        options,
        correctOptionId: asString(questionRecord.correct_option_id),
        selectedOptionId: asString(questionRecord.selected_option_id),
        isCorrect: asBoolean(questionRecord.is_correct),
        explanation: asString(questionRecord.explanation),
      };
    })
    .filter((question): question is SaintPaulTutorQuizQuestion => question !== null);
}

function isNumericStudentId(value?: string | null) {
  return Boolean(value?.trim() && /^\d{7}$/.test(value.trim()));
}

function hasCompletedAiTutor(session: SaintPaulResearchSessionSummary) {
  if (session.mode !== "quiz-plus-ai-tutor") {
    return false;
  }

  const normalizedStatuses = session.objective_statuses.filter(Boolean);
  if (normalizedStatuses.length > 0) {
    return normalizedStatuses.every((status) => status === "completed");
  }

  return Boolean(
    session.post_quiz_submitted ||
      session.current_tab === "post" ||
      session.current_tab === "complete" ||
      session.completed_at,
  );
}

function Badge({
  children,
  tone = "slate",
}: Readonly<{ children: ReactNode; tone?: "slate" | "emerald" | "amber" | "rose" | "sky" }>) {
  const tones = {
    slate: "border-slate-700 bg-slate-900/80 text-slate-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  eyebrow,
  action,
  children,
}: Readonly<{
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
          ) : null}
          <h2 className="font-[family:var(--font-outfit)] text-xl text-slate-100">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
}: Readonly<{ label: string; value: string; sublabel?: string }>) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 font-[family:var(--font-outfit)] text-3xl text-slate-100">{value}</p>
      {sublabel ? <p className="mt-2 text-sm text-slate-400">{sublabel}</p> : null}
    </div>
  );
}

function EmptyPanel({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center">
      <p className="font-medium text-slate-200">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function AssessmentPanel({
  record,
  label,
}: Readonly<{
  record?: SaintPaulResearchAssessmentRecord | null;
  label: string;
}>) {
  if (!record) {
    return (
      <EmptyPanel
        title={`${label} not submitted`}
        description="This session does not have a stored submitted assessment for this stage."
      />
    );
  }

  const entries = Object.entries(record.responses);
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-[family:var(--font-outfit)] text-lg text-slate-100">{label}</p>
          <p className="text-sm text-slate-400">{formatDateTime(record.submitted_at)}</p>
        </div>
        <Badge tone={entries.length > 0 ? "emerald" : "slate"}>{`${entries.length} responses`}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">No saved answers were found in the assessment payload.</p>
        ) : (
          entries.map(([questionId, value]) => (
            <div
              key={questionId}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{questionId}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(value).map(([field, fieldValue]) => (
                  <span
                    key={field}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
                  >
                    <span className="text-slate-500">{field}:</span> {String(fieldValue || "None")}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SaintPaulResearchDashboard(): JSX.Element {
  const [overview, setOverview] = useState<SaintPaulResearchOverviewResponse | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<DashboardViewMode>("table");
  const [showValidStudentIdsOnly, setShowValidStudentIdsOnly] = useState(true);
  const [hideZeroStudentRows, setHideZeroStudentRows] = useState(true);
  const [selectedCompletionRowKey, setSelectedCompletionRowKey] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [detailBySession, setDetailBySession] = useState<
    Record<string, SaintPaulResearchSessionDetailResponse>
  >({});

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const fetchSessionDetail = useCallback(
    async (sessionId: string, force = false) => {
      if (!force && detailBySession[sessionId]) {
        return;
      }

      setIsDetailLoading(true);
      setDetailError(null);

      try {
        const response = await fetch(
          `${API_BASE}/saintpaul/research/session/${encodeURIComponent(sessionId)}`,
        );
        const payload = (await response.json()) as SaintPaulResearchSessionDetailResponse & {
          detail?: string;
        };

        if (!response.ok) {
          throw new Error(payload.detail ?? `Request failed with ${response.status}`);
        }

        setDetailBySession((current) => ({
          ...current,
          [sessionId]: payload as SaintPaulResearchSessionDetailResponse,
        }));
      } catch (error) {
        console.error("Unable to load Saint Paul session detail", error);
        setDetailError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsDetailLoading(false);
      }
    },
    [detailBySession],
  );

  const loadOverview = useCallback(async (forceRefresh = false) => {
    setIsOverviewLoading(true);
    setOverviewError(null);

    try {
      const response = await fetch(
        `${API_BASE}/saintpaul/research/overview${forceRefresh ? "?refresh=true" : ""}`,
      );
      const payload = (await response.json()) as SaintPaulResearchOverviewResponse & {
        detail?: string;
      };

      if (!response.ok) {
        throw new Error(payload.detail ?? `Request failed with ${response.status}`);
      }

      const overviewPayload = payload as SaintPaulResearchOverviewResponse;
      setOverview(overviewPayload);
    } catch (error) {
      console.error("Unable to load Saint Paul research overview", error);
      setOverviewError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (viewMode !== "details" || !selectedSessionId) {
      return;
    }

    void fetchSessionDetail(selectedSessionId);
  }, [fetchSessionDetail, selectedSessionId, viewMode]);

  useEffect(() => {
    if (viewMode !== "details" || !selectedSessionId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchSessionDetail(selectedSessionId, true);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchSessionDetail, selectedSessionId, viewMode]);

  const handleRefresh = useCallback(async () => {
    setDetailBySession({});
    await loadOverview(true);
    if (viewMode === "details" && selectedSessionId) {
      await fetchSessionDetail(selectedSessionId, true);
    }
  }, [fetchSessionDetail, loadOverview, selectedSessionId, viewMode]);

  const students = useMemo(() => overview?.students ?? [], [overview]);
  const indexedStudents = useMemo(() => {
    if (!showValidStudentIdsOnly) {
      return students;
    }

    return students.filter((student) => isNumericStudentId(student.student_id));
  }, [showValidStudentIdsOnly, students]);

  const hiddenInvalidStudentCount = students.length - indexedStudents.length;
  const indexedSessionCount = useMemo(() => {
    return indexedStudents.reduce((total, student) => total + student.sessions.length, 0);
  }, [indexedStudents]);

  const filteredStudents = useMemo(() => {
    if (!deferredSearch) {
      return indexedStudents;
    }

    return indexedStudents.filter((student) => {
      const haystack = [
        student.student_id,
        ...student.sessions.flatMap((session) => [
          session.topic ?? "",
          session.subject ?? "",
          session.grade ?? "",
          session.version ?? "",
          session.mode ?? "",
          session.session_id,
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [deferredSearch, indexedStudents]);

  useEffect(() => {
    if (indexedStudents.length === 0) {
      if (selectedStudentId || selectedSessionId) {
        startTransition(() => {
          setSelectedStudentId(null);
          setSelectedSessionId(null);
        });
      }
      return;
    }

    const selectedStudentFromVisibleList =
      indexedStudents.find((student) => student.student_id === selectedStudentId) ?? null;
    const selectedSessionFromVisibleList =
      indexedStudents
        .flatMap((student) => student.sessions)
        .find((session) => session.session_id === selectedSessionId) ?? null;

    const fallbackStudent =
      selectedStudentFromVisibleList ??
      (selectedSessionFromVisibleList
        ? indexedStudents.find(
            (student) => student.student_id === selectedSessionFromVisibleList.student_id,
          ) ?? null
        : null) ??
      indexedStudents[0];
    const fallbackSession =
      fallbackStudent.sessions.find((session) => session.session_id === selectedSessionId) ??
      (selectedSessionFromVisibleList &&
      fallbackStudent.sessions.some(
        (session) => session.session_id === selectedSessionFromVisibleList.session_id,
      )
        ? selectedSessionFromVisibleList
        : null) ??
      fallbackStudent.sessions[0] ??
      null;

    if (
      fallbackStudent.student_id !== selectedStudentId ||
      (fallbackSession?.session_id ?? null) !== selectedSessionId
    ) {
      startTransition(() => {
        setSelectedStudentId(fallbackStudent.student_id);
        setSelectedSessionId(fallbackSession?.session_id ?? null);
      });
    }
  }, [indexedStudents, selectedSessionId, selectedStudentId]);

  const selectedStudent = useMemo(() => {
    return indexedStudents.find((student) => student.student_id === selectedStudentId) ?? null;
  }, [indexedStudents, selectedStudentId]);

  const selectedSessionSummary = useMemo(() => {
    return (
      selectedStudent?.sessions.find((session) => session.session_id === selectedSessionId) ??
      indexedStudents
        .flatMap((student) => student.sessions)
        .find((session) => session.session_id === selectedSessionId) ??
      null
    );
  }, [indexedStudents, selectedSessionId, selectedStudent]);

  const completionRows = useMemo(() => {
    return SAINT_PAUL_DROPDOWN_COMBINATIONS.map((combination) => {
      const totalStudents = new Set<string>();
      const preQuizStudents = new Set<string>();
      const aiTutorStudents = new Set<string>();
      const postQuizStudents = new Set<string>();

      indexedStudents.forEach((student) => {
        student.sessions.forEach((session) => {
          if (
            session.subject !== combination.subject ||
            session.version !== combination.version ||
            session.grade !== combination.grade ||
            session.mode !== combination.mode
          ) {
            return;
          }

          const normalizedStudentId = session.student_id?.trim() ?? student.student_id.trim();
          if (!normalizedStudentId) {
            return;
          }

          totalStudents.add(normalizedStudentId);

          if (session.pre_quiz_submitted) {
            preQuizStudents.add(normalizedStudentId);
          }

          if (hasCompletedAiTutor(session)) {
            aiTutorStudents.add(normalizedStudentId);
          }

          if (session.post_quiz_submitted) {
            postQuizStudents.add(normalizedStudentId);
          }
        });
      });

      return {
        ...combination,
        studentIds: [...totalStudents].sort((left, right) => left.localeCompare(right)),
        totalStudents: totalStudents.size,
        preQuizCompleted: preQuizStudents.size,
        aiTutorCompleted:
          combination.mode === "quiz-plus-ai-tutor" ? aiTutorStudents.size : null,
        postQuizCompleted: postQuizStudents.size,
      };
    });
  }, [indexedStudents]);

  const visibleCompletionRows = useMemo(() => {
    if (!hideZeroStudentRows) {
      return completionRows;
    }

    return completionRows.filter((row) => row.totalStudents > 0);
  }, [completionRows, hideZeroStudentRows]);

  const hiddenZeroStudentRowCount = completionRows.length - visibleCompletionRows.length;

  const selectedCompletionRow = useMemo(() => {
    return visibleCompletionRows.find((row) => row.key === selectedCompletionRowKey) ?? null;
  }, [selectedCompletionRowKey, visibleCompletionRows]);

  const selectedDetail = selectedSessionId ? detailBySession[selectedSessionId] : null;

  const eventCount = selectedDetail?.events.length ?? 0;
  const messageCount = selectedDetail?.messages.length ?? 0;
  const errorCount = selectedDetail?.errors.length ?? 0;
  const artifactCount =
    (selectedDetail?.generated_quizzes.length ?? 0) +
    (selectedDetail?.quiz_attempts.length ?? 0) +
    (selectedDetail?.generated_images.length ?? 0);

  const eventsNewestFirst = useMemo(() => {
    return [...(selectedDetail?.events ?? [])].reverse();
  }, [selectedDetail?.events]);

  const errorsNewestFirst = useMemo(() => {
    return [...(selectedDetail?.errors ?? [])].reverse();
  }, [selectedDetail?.errors]);

  const quizAttemptsNewestFirst = useMemo(() => {
    return [...(selectedDetail?.quiz_attempts ?? [])].reverse();
  }, [selectedDetail?.quiz_attempts]);

  const generatedQuizzesNewestFirst = useMemo(() => {
    return [...(selectedDetail?.generated_quizzes ?? [])].reverse();
  }, [selectedDetail?.generated_quizzes]);

  const generatedImagesNewestFirst = useMemo(() => {
    return [...(selectedDetail?.generated_images ?? [])].reverse();
  }, [selectedDetail?.generated_images]);

  const generatedImageAssetUrlByKey = useMemo(() => {
    const map = new Map<string, string>();
    (selectedDetail?.generated_images ?? []).forEach((artifact) => {
      if (artifact.asset_key && artifact.asset_url) {
        map.set(artifact.asset_key, artifact.asset_url);
      }
    });
    return map;
  }, [selectedDetail?.generated_images]);

  const tutorActivityTimeline = useMemo<SaintPaulTutorActivityItem[]>(() => {
    if (!selectedDetail) {
      return [];
    }

    const items: SaintPaulTutorActivityItem[] = [];

    selectedDetail.messages.forEach((message) => {
      items.push({
        id: message.item_key,
        kind: "message",
        timestamp: message.created_at ?? null,
        sortTime: toSortableTime(message.created_at),
        objectiveIndex: message.objective_index,
        role: message.role,
        content: message.content,
        model: message.model,
      });
    });

    selectedDetail.generated_quizzes.forEach((artifact) => {
      items.push({
        id: artifact.item_key,
        kind: "generated_quiz",
        timestamp: artifact.created_at ?? null,
        sortTime: toSortableTime(artifact.created_at),
        objectiveIndex: artifact.objective_index,
        title: artifact.title,
        source: artifact.source,
        questions: artifact.questions,
      });
    });

    selectedDetail.quiz_attempts.forEach((artifact) => {
      items.push({
        id: artifact.item_key,
        kind: "quiz_attempt",
        timestamp: artifact.submitted_at ?? null,
        sortTime: toSortableTime(artifact.submitted_at),
        objectiveIndex: artifact.objective_index,
        title: artifact.title,
        score: artifact.score,
        totalQuestions: artifact.total_questions,
        questions: artifact.questions,
      });
    });

    selectedDetail.generated_images.forEach((artifact) => {
      items.push({
        id: artifact.item_key,
        kind: "generated_image",
        timestamp: artifact.created_at ?? null,
        sortTime: toSortableTime(artifact.created_at),
        objectiveIndex: artifact.objective_index,
        prompt: artifact.prompt,
        source: artifact.source,
        imageUrl: artifact.asset_url,
      });
    });

    return items.sort((left, right) => {
      if (left.sortTime !== right.sortTime) {
        return left.sortTime - right.sortTime;
      }
      return left.id.localeCompare(right.id);
    });
  }, [selectedDetail]);

  const unifiedTimeline = useMemo<SaintPaulResearchTimelineItem[]>(() => {
    if (!selectedDetail) {
      return [];
    }

    const timelineItems: SaintPaulResearchTimelineItem[] = [];

    if (selectedDetail.pre_assessment) {
      const responseCount = Object.keys(selectedDetail.pre_assessment.responses).length;
      timelineItems.push({
        id: selectedDetail.pre_assessment.item_key,
        kind: "assessment",
        timestamp: selectedDetail.pre_assessment.submitted_at ?? null,
        sortTime: toSortableTime(selectedDetail.pre_assessment.submitted_at),
        title: "Pre Quiz Submitted",
        summary:
          responseCount > 0
            ? `${responseCount} saved responses`
            : "Submitted without stored answers",
        tone: "emerald",
        label: "assessment",
        metadata: ["pre quiz"],
        payloadText: stringifyCompact(selectedDetail.pre_assessment.responses),
      });
    }

    if (selectedDetail.post_assessment) {
      const responseCount = Object.keys(selectedDetail.post_assessment.responses).length;
      timelineItems.push({
        id: selectedDetail.post_assessment.item_key,
        kind: "assessment",
        timestamp: selectedDetail.post_assessment.submitted_at ?? null,
        sortTime: toSortableTime(selectedDetail.post_assessment.submitted_at),
        title: "Post Quiz Submitted",
        summary:
          responseCount > 0
            ? `${responseCount} saved responses`
            : "Submitted without stored answers",
        tone: "emerald",
        label: "assessment",
        metadata: ["post quiz"],
        payloadText: stringifyCompact(selectedDetail.post_assessment.responses),
      });
    }

    selectedDetail.messages.forEach((message) => {
      const isAssistant = message.role === "assistant";
      timelineItems.push({
        id: message.item_key,
        kind: "message",
        timestamp: message.created_at ?? null,
        sortTime: toSortableTime(message.created_at),
        title: isAssistant ? "Tutor Message" : "Student Message",
        summary: message.content || "No content",
        tone: isAssistant ? "sky" : "slate",
        label: isAssistant ? "assistant" : "student",
        objectiveIndex: message.objective_index,
        metadata: message.model ? [message.model] : undefined,
      });
    });

    selectedDetail.generated_quizzes.forEach((artifact) => {
      timelineItems.push({
        id: artifact.item_key,
        kind: "artifact",
        timestamp: artifact.created_at ?? null,
        sortTime: toSortableTime(artifact.created_at),
        title: "Quiz Generated",
        summary: artifact.title || "Untitled generated quiz",
        tone: "sky",
        label: "quiz",
        objectiveIndex: artifact.objective_index,
        metadata: [
          `${artifact.questions.length} questions`,
          artifact.source ? `source: ${artifact.source}` : "",
        ].filter(Boolean),
      });
    });

    selectedDetail.quiz_attempts.forEach((artifact) => {
      timelineItems.push({
        id: artifact.item_key,
        kind: "artifact",
        timestamp: artifact.submitted_at ?? null,
        sortTime: toSortableTime(artifact.submitted_at),
        title: "Quiz Answered",
        summary: artifact.title || "Untitled quiz attempt",
        tone: "emerald",
        label: "attempt",
        objectiveIndex: artifact.objective_index,
        metadata: [`score ${artifact.score ?? "N/A"} / ${artifact.total_questions ?? "?"}`],
        payloadText: stringifyCompact(artifact.questions),
      });
    });

    selectedDetail.generated_images.forEach((artifact) => {
      timelineItems.push({
        id: artifact.item_key,
        kind: "artifact",
        timestamp: artifact.created_at ?? null,
        sortTime: toSortableTime(artifact.created_at),
        title: "Image Generated",
        summary: artifact.prompt || "No prompt stored",
        tone: "amber",
        label: "image",
        objectiveIndex: artifact.objective_index,
        metadata: [
          artifact.source ? `source: ${artifact.source}` : "",
          artifact.content_type || "",
          artifact.size_bytes != null ? `${formatNumber(artifact.size_bytes)} bytes` : "",
        ].filter(Boolean),
        imageUrl: artifact.asset_url,
      });
    });

    selectedDetail.events.forEach((event) => {
      const rawAssetKey = event.payload["asset_key"];
      const assetKey = typeof rawAssetKey === "string" ? rawAssetKey : null;
      timelineItems.push({
        id: event.item_key,
        kind: "event",
        timestamp: event.recorded_at || event.client_timestamp || null,
        sortTime: toSortableTime(event.recorded_at || event.client_timestamp),
        title: formatEventTypeLabel(event.event_type),
        summary: event.tab ? `tab: ${event.tab}` : "Interaction telemetry",
        tone: "slate",
        label: "event",
        objectiveIndex: event.objective_index,
        payloadText: stringifyCompact(event.payload),
        imageUrl:
          event.event_type === "image_generated" && assetKey
            ? generatedImageAssetUrlByKey.get(assetKey) ?? null
            : null,
      });
    });

    selectedDetail.errors.forEach((error) => {
      timelineItems.push({
        id: error.item_key,
        kind: "error",
        timestamp: error.recorded_at ?? null,
        sortTime: toSortableTime(error.recorded_at),
        title: error.stage ? `Error: ${error.stage}` : "Stored Error",
        summary: error.error_message || "No error message stored",
        tone: "rose",
        label: "error",
        objectiveIndex: error.objective_index,
        metadata: [error.error_scope || "", error.error_code || ""].filter(Boolean),
        payloadText: stringifyCompact(error.metadata),
      });
    });

    return timelineItems.sort((left, right) => {
      if (right.sortTime !== left.sortTime) {
        return right.sortTime - left.sortTime;
      }
      return right.id.localeCompare(left.id);
    });
  }, [generatedImageAssetUrlByKey, selectedDetail]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_#07111d_0%,_#020617_55%,_#02030a_100%)] text-slate-100">
      <WorkspaceBanner
        title="Saint Paul AI Tutor Research"
        current="Internal / Saint Paul"
        subtitle="Inspect stored student sessions, quiz submissions, tutor interactions, and generated artifacts."
        maxWidthClassName="max-w-[1600px]"
        rightSlot={
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
            onClick={() => {
              void handleRefresh();
            }}
          >
            {isOverviewLoading ? <Loader2 className="animate-spin" /> : <ListRestart />}
            Refresh
          </Button>
        }
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-6">
        <section className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-3 shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/80 p-1">
            {[
              { id: "table" as const, label: "Table Only" },
              { id: "details" as const, label: "Details Only" },
            ].map((option) => {
              const isActive = viewMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-sky-500/20 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.24)]"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {viewMode === "table" ? (
          <SectionCard
            title="Completion Matrix"
            eyebrow="Dropdown Coverage"
            action={
              <div className="flex flex-wrap gap-2">
                <Badge tone="sky">{`${formatNumber(visibleCompletionRows.length)} combinations`}</Badge>
                <Badge tone={showValidStudentIdsOnly ? "emerald" : "amber"}>
                  {showValidStudentIdsOnly ? "7-digit ids only" : "all student ids"}
                </Badge>
                <Badge tone={hideZeroStudentRows ? "emerald" : "amber"}>
                  {hideZeroStudentRows ? "0-student rows hidden" : "0-student rows shown"}
                </Badge>
              </div>
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-3xl text-sm text-slate-400">
                Counts are grouped by the exact subject, version, grade, and mode combinations from
                the Saint Paul dropdown. Each count is a distinct student total, not session count.
              </p>
              {showValidStudentIdsOnly && hiddenInvalidStudentCount > 0 ? (
                <Badge tone="amber">{`${formatNumber(hiddenInvalidStudentCount)} non-7-digit ids hidden`}</Badge>
              ) : null}
              {hideZeroStudentRows && hiddenZeroStudentRowCount > 0 ? (
                <Badge tone="amber">{`${formatNumber(hiddenZeroStudentRowCount)} 0-student rows hidden`}</Badge>
              ) : null}
            </div>

            <div className="mt-5 flex max-w-xl flex-col gap-3">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <input
                  type="checkbox"
                  checked={showValidStudentIdsOnly}
                  onChange={(event) => setShowValidStudentIdsOnly(event.target.checked)}
                  className="mt-1 size-4 rounded border-slate-700 bg-slate-950 text-sky-400 focus:ring-sky-400"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-slate-100">
                    Keep 7-digit student IDs only
                  </span>
                  <span className="block text-xs leading-5 text-slate-400">
                    Hides IDs unless they are exactly 7 digits, so values like `111 18` or `12345`
                    are excluded from the completion table.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <input
                  type="checkbox"
                  checked={hideZeroStudentRows}
                  onChange={(event) => setHideZeroStudentRows(event.target.checked)}
                  className="mt-1 size-4 rounded border-slate-700 bg-slate-950 text-sky-400 focus:ring-sky-400"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-slate-100">
                    Hide rows with 0 students
                  </span>
                  <span className="block text-xs leading-5 text-slate-400">
                    Keeps the matrix focused on combinations that currently have at least one
                    distinct student.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[1080px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="sticky left-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3">
                      Subject
                    </th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3">Version</th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3">Grade</th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3">Mode</th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-right">
                      Students
                    </th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-right">
                      Pre Quiz
                    </th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-right">
                      AI Tutor
                    </th>
                    <th className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 text-right">
                      Post Quiz
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCompletionRows.map((row) => (
                    <tr key={row.key} className="text-slate-200">
                      <td className="sticky left-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3 font-medium">
                        {row.subjectLabel}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3">
                        {row.versionLabel}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3">
                        {row.gradeLabel}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3">
                        {row.modeLabel}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3 text-right font-[family:var(--font-outfit)] text-lg text-slate-100">
                        {row.totalStudents > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCompletionRowKey(row.key)}
                            className="inline-flex w-full justify-end rounded-lg px-2 py-1 text-right text-lg text-slate-100 underline decoration-slate-600 underline-offset-4 transition hover:text-sky-200 hover:decoration-sky-300"
                            aria-expanded={selectedCompletionRowKey === row.key}
                          >
                            {formatNumber(row.totalStudents)}
                          </button>
                        ) : (
                          formatNumber(row.totalStudents)
                        )}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3 text-right font-[family:var(--font-outfit)] text-lg text-emerald-200">
                        {formatNumber(row.preQuizCompleted)}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3 text-right font-[family:var(--font-outfit)] text-lg text-sky-200">
                        {row.aiTutorCompleted == null ? (
                          <span className="text-slate-500">-</span>
                        ) : (
                          formatNumber(row.aiTutorCompleted)
                        )}
                      </td>
                      <td className="border-b border-slate-800 bg-slate-950/40 px-4 py-3 text-right font-[family:var(--font-outfit)] text-lg text-amber-200">
                        {formatNumber(row.postQuizCompleted)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : null}

        {viewMode === "details" ? (
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/85 shadow-[0_24px_80px_rgba(2,6,23,0.42)]">
              <div className="border-b border-slate-800 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.88))] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200/70">Student Index</p>
                <h2 className="mt-2 font-[family:var(--font-outfit)] text-2xl text-slate-50">
                  Activity Browser
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Search by student, topic, subject, grade, mode, or session id.
                </p>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Students"
                    value={formatNumber(indexedStudents.length)}
                    sublabel={
                      showValidStudentIdsOnly ? "7-digit IDs in view" : "All tracked students"
                    }
                  />
                  <MetricCard
                    label="Sessions"
                    value={formatNumber(indexedSessionCount)}
                    sublabel={
                      showValidStudentIdsOnly && hiddenInvalidStudentCount > 0
                        ? `${formatNumber(hiddenInvalidStudentCount)} invalid IDs hidden`
                        : overview?.persistence_enabled
                          ? "Persistence enabled"
                          : "Persistence disabled"
                    }
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <input
                    type="checkbox"
                    checked={showValidStudentIdsOnly}
                    onChange={(event) => setShowValidStudentIdsOnly(event.target.checked)}
                    className="mt-1 size-4 rounded border-slate-700 bg-slate-950 text-sky-400 focus:ring-sky-400"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium text-slate-100">
                      Keep 7-digit student IDs only
                    </span>
                    <span className="block text-xs leading-5 text-slate-400">
                      Hides IDs unless they are exactly 7 digits, so values like `111 18` or
                      `12345` are excluded from the activity browser.
                    </span>
                  </span>
                </label>

                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Find a student, topic, or session"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                  />
                </label>

                {overviewError ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                    {overviewError}
                  </div>
                ) : null}

                <div className="max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto pr-1">
                  {isOverviewLoading ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                      <Loader2 className="size-4 animate-spin" />
                      Loading student activity...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <EmptyPanel
                      title="No students matched"
                      description="Try a different search term or refresh the activity index."
                    />
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = student.student_id === selectedStudentId;
                      return (
                        <div
                          key={student.student_id}
                          className={cn(
                            "rounded-[28px] border p-4 transition",
                            isSelected
                              ? "border-sky-400/40 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.18)]"
                              : "border-slate-800 bg-slate-900/70 hover:border-slate-700",
                          )}
                        >
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => {
                              startTransition(() => {
                                setSelectedStudentId(student.student_id);
                                setSelectedSessionId(student.sessions[0]?.session_id ?? null);
                              });
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="flex items-center gap-2 font-[family:var(--font-outfit)] text-lg text-slate-100">
                                  <UserRound className="size-4 text-sky-300" />
                                  <span className="truncate">{student.student_id}</span>
                                </p>
                                <p className="mt-2 text-sm text-slate-400">
                                  {student.session_count} sessions
                                </p>
                              </div>
                              <ChevronRight
                                className={cn(
                                  "mt-1 size-4 shrink-0 text-slate-500 transition",
                                  isSelected ? "translate-x-1 text-sky-300" : "",
                                )}
                              />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge tone="sky">{formatShortDate(student.last_seen_at)}</Badge>
                              <Badge tone={student.session_count > 1 ? "amber" : "slate"}>
                                {student.session_count > 1 ? "repeat learner" : "single session"}
                              </Badge>
                            </div>
                          </button>

                          {isSelected ? (
                            <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                              {student.sessions.map((session) => {
                                const isSessionSelected = session.session_id === selectedSessionId;
                                return (
                                  <button
                                    type="button"
                                    key={session.session_id}
                                    className={cn(
                                      "w-full rounded-2xl border px-3 py-3 text-left transition",
                                      isSessionSelected
                                        ? "border-sky-400/40 bg-slate-950"
                                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700",
                                    )}
                                    onClick={() => {
                                      startTransition(() => {
                                        setSelectedStudentId(student.student_id);
                                        setSelectedSessionId(session.session_id);
                                      });
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-100">
                                          {session.topic || "Untitled topic"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                          {[
                                            session.subject,
                                            session.grade,
                                            session.version,
                                            session.mode,
                                          ]
                                            .filter(Boolean)
                                            .join(" • ")}
                                        </p>
                                      </div>
                                      <Clock3 className="size-4 shrink-0 text-slate-500" />
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <Badge tone={session.pre_quiz_submitted ? "emerald" : "slate"}>
                                        pre {session.pre_quiz_submitted ? "done" : "pending"}
                                      </Badge>
                                      <Badge tone={session.post_quiz_submitted ? "emerald" : "slate"}>
                                        post {session.post_quiz_submitted ? "done" : "pending"}
                                      </Badge>
                                      <Badge
                                        tone={session.message_count > 0 ? "sky" : "slate"}
                                      >
                                        {`${formatNumber(session.message_count)} msgs`}
                                      </Badge>
                                      <Badge
                                        tone={session.artifact_count > 0 ? "amber" : "slate"}
                                      >
                                        {`${formatNumber(session.artifact_count)} artifacts`}
                                      </Badge>
                                      <Badge
                                        tone={session.event_count > 0 ? "slate" : "slate"}
                                      >
                                        {`${formatNumber(session.event_count)} events`}
                                      </Badge>
                                    </div>
                                    {session.error_count > 0 ? (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge tone="rose">{`${formatNumber(session.error_count)} errors`}</Badge>
                                      </div>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            {!selectedSessionSummary ? (
              <SectionCard title="Select a session" eyebrow="Session Detail">
                <EmptyPanel
                  title="No Saint Paul session selected"
                  description="Choose a student on the left to inspect their stored quiz submissions, event log, tutor conversation, artifacts, and errors."
                />
              </SectionCard>
            ) : (
              <>
                <SectionCard
                  title={selectedSessionSummary.topic || "Untitled session"}
                  eyebrow="Session Detail"
                  action={
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="sky">{selectedSessionSummary.session_id.slice(0, 8)}</Badge>
                      <Badge
                        tone={selectedSessionSummary.completed_at ? "emerald" : "amber"}
                      >
                        {selectedSessionSummary.completed_at ? "completed" : "in progress"}
                      </Badge>
                    </div>
                  }
                >
                  <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                    <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
                      <p className="font-[family:var(--font-outfit)] text-2xl text-slate-50">
                        {selectedSessionSummary.student_id || "Unknown student"}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm text-slate-400">
                        {[
                          selectedSessionSummary.subject,
                          selectedSessionSummary.grade,
                          selectedSessionSummary.version,
                          selectedSessionSummary.mode,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge
                          tone={
                            selectedSessionSummary.pre_quiz_submitted ? "emerald" : "slate"
                          }
                        >
                          pre quiz
                        </Badge>
                        <Badge
                          tone={
                            selectedSessionSummary.post_quiz_submitted ? "emerald" : "slate"
                          }
                        >
                          post quiz
                        </Badge>
                        <Badge
                          tone={
                            selectedSessionSummary.lesson_instruction_acknowledged
                              ? "sky"
                              : "amber"
                          }
                        >
                          lesson intro
                        </Badge>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <MetricCard
                          label="Started"
                          value={formatShortDate(selectedSessionSummary.started_at)}
                          sublabel={formatDateTime(selectedSessionSummary.started_at)}
                        />
                        <MetricCard
                          label="Last Seen"
                          value={formatShortDate(selectedSessionSummary.last_seen_at)}
                          sublabel={formatDateTime(selectedSessionSummary.last_seen_at)}
                        />
                        <MetricCard
                          label="Completed"
                          value={
                            selectedSessionSummary.completed_at
                              ? formatShortDate(selectedSessionSummary.completed_at)
                              : "Not yet"
                          }
                          sublabel={formatDateTime(selectedSessionSummary.completed_at)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <MetricCard
                        label="Events"
                        value={formatNumber(eventCount)}
                        sublabel="Interaction telemetry"
                      />
                      <MetricCard
                        label="Messages"
                        value={formatNumber(messageCount)}
                        sublabel="Tutor conversation turns"
                      />
                      <MetricCard
                        label="Artifacts"
                        value={formatNumber(artifactCount)}
                        sublabel="Quizzes, attempts, and images"
                      />
                      <MetricCard
                        label="Errors"
                        value={formatNumber(errorCount)}
                        sublabel="Persistence and tutor issues"
                      />
                    </div>
                  </div>
                </SectionCard>

                {detailError ? (
                  <SectionCard title="Detail Load Error" eyebrow="Session Detail">
                    <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                      {detailError}
                    </div>
                  </SectionCard>
                ) : null}

                {isDetailLoading && !selectedDetail ? (
                  <SectionCard title="Loading session detail" eyebrow="Session Detail">
                    <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-slate-300">
                      <Loader2 className="size-4 animate-spin" />
                      Pulling quiz submissions, events, messages, and artifacts from DynamoDB...
                    </div>
                  </SectionCard>
                ) : selectedDetail ? (
                  <>
                    <SectionCard
                      title="Unified Timeline"
                      eyebrow="Chronological Activity"
                      action={
                        <Badge tone="sky">{`${formatNumber(unifiedTimeline.length)} entries`}</Badge>
                      }
                    >
                      {unifiedTimeline.length === 0 ? (
                        <EmptyPanel
                          title="No session activity"
                          description="This session does not have stored messages, artifacts, events, or assessments yet."
                        />
                      ) : (
                        <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                          {unifiedTimeline.map((item) => {
                            const Icon =
                              item.kind === "message"
                                ? item.label === "assistant"
                                  ? Bot
                                  : UserRound
                                : item.kind === "artifact"
                                  ? item.label === "image"
                                    ? ImageIcon
                                    : item.label === "attempt"
                                      ? MessageSquareText
                                      : Sparkles
                                  : item.kind === "assessment"
                                    ? Clock3
                                    : item.kind === "error"
                                      ? AlertTriangle
                                      : Clock3;

                            return (
                              <div
                                key={item.id}
                                className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Icon
                                        className={cn(
                                          "size-4",
                                          item.tone === "rose"
                                            ? "text-rose-300"
                                            : item.tone === "emerald"
                                              ? "text-emerald-300"
                                              : item.tone === "amber"
                                                ? "text-amber-300"
                                                : item.tone === "sky"
                                                  ? "text-sky-300"
                                                  : "text-slate-300",
                                        )}
                                      />
                                      <Badge tone={item.tone}>{item.label}</Badge>
                                      {item.objectiveIndex != null ? (
                                        <Badge tone="amber">{`objective ${item.objectiveIndex + 1}`}</Badge>
                                      ) : null}
                                      {item.metadata?.map((value) => (
                                        <Badge key={`${item.id}-${value}`} tone="slate">
                                          {value}
                                        </Badge>
                                      ))}
                                    </div>
                                    <p className="mt-3 font-medium text-slate-100">{item.title}</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                      {item.summary}
                                    </p>
                                  </div>
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    {formatDateTime(item.timestamp)}
                                  </p>
                                </div>
                                {item.imageUrl ? (
                                  <a
                                    href={item.imageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt={item.summary || "Generated Saint Paul image"}
                                      loading="lazy"
                                      className="max-h-[420px] w-full object-contain"
                                    />
                                  </a>
                                ) : null}
                                {item.payloadText ? (
                                  <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs leading-6 text-slate-300">
                                    {item.payloadText}
                                  </pre>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </SectionCard>

                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                      <SectionCard
                        title="Assessments"
                        eyebrow="Pre / Post Quiz"
                        action={
                          <Badge tone="slate">
                            {selectedDetail.pre_assessment || selectedDetail.post_assessment
                              ? "submitted"
                              : "no assessment records"}
                          </Badge>
                        }
                      >
                        <div className="grid gap-4 lg:grid-cols-2">
                          <AssessmentPanel
                            label="Pre Quiz"
                            record={selectedDetail.pre_assessment}
                          />
                          <AssessmentPanel
                            label="Post Quiz"
                            record={selectedDetail.post_assessment}
                          />
                        </div>
                      </SectionCard>

                      <SectionCard
                        title="Tutor Chat"
                        eyebrow="Conversation"
                        action={
                          <Badge tone="sky">{`${formatNumber(tutorActivityTimeline.length)} entries`}</Badge>
                        }
                      >
                        {tutorActivityTimeline.length === 0 ? (
                          <EmptyPanel
                            title="No tutor activity"
                            description="This session does not have stored tutor messages or quiz activity."
                          />
                        ) : (
                          <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
                            {tutorActivityTimeline.map((item) => {
                              if (item.kind === "message") {
                                const isAssistant = item.role === "assistant";

                                return (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      "rounded-[24px] border p-4",
                                      isAssistant
                                        ? "border-sky-500/20 bg-sky-500/10"
                                        : "border-slate-800 bg-slate-900/70",
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        {isAssistant ? (
                                          <Bot className="size-4 text-sky-300" />
                                        ) : (
                                          <UserRound className="size-4 text-slate-300" />
                                        )}
                                        <span className="text-sm font-medium capitalize text-slate-100">
                                          {item.role || "unknown"}
                                        </span>
                                        {item.objectiveIndex != null ? (
                                          <Badge tone="slate">
                                            objective {item.objectiveIndex + 1}
                                          </Badge>
                                        ) : null}
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {formatDateTime(item.timestamp)}
                                      </span>
                                    </div>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                      {item.content || "No content"}
                                    </p>
                                    {item.model ? (
                                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                                        {item.model}
                                      </p>
                                    ) : null}
                                  </div>
                                );
                              }

                              if (item.kind === "generated_quiz") {
                                const questions = parseTutorQuizQuestions(item.questions);

                                return (
                                  <div
                                    key={item.id}
                                    className="rounded-[24px] border border-sky-500/20 bg-sky-500/10 p-4"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-sky-300" />
                                        <span className="text-sm font-medium text-slate-100">
                                          Quiz Generated
                                        </span>
                                        {item.objectiveIndex != null ? (
                                          <Badge tone="slate">
                                            objective {item.objectiveIndex + 1}
                                          </Badge>
                                        ) : null}
                                        <Badge tone="sky">quiz</Badge>
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {formatDateTime(item.timestamp)}
                                      </span>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-slate-100">
                                      {item.title || "Untitled generated quiz"}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                      {`${formatNumber(questions.length)} questions`}
                                      {item.source ? ` • source: ${item.source}` : ""}
                                    </p>
                                    {questions.length > 0 ? (
                                      <div className="mt-4 space-y-3">
                                        {questions.map((question, index) => (
                                          <div
                                            key={question.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                                          >
                                            <p className="text-sm font-medium leading-6 text-slate-100">
                                              {`${index + 1}. ${question.prompt}`}
                                            </p>
                                            <div className="mt-3 space-y-2">
                                              {question.options.map((option) => {
                                                const isCorrectOption =
                                                  option.id === question.correctOptionId;

                                                return (
                                                  <div
                                                    key={`${question.id}-${option.id}`}
                                                    className={cn(
                                                      "rounded-xl border px-3 py-2 text-sm",
                                                      isCorrectOption
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                                                        : "border-slate-800 bg-slate-900/70 text-slate-300",
                                                    )}
                                                  >
                                                    <span className="font-medium">
                                                      {option.id}.
                                                    </span>{" "}
                                                    {option.text}
                                                    {isCorrectOption ? (
                                                      <span className="ml-2 text-xs uppercase tracking-[0.18em] text-emerald-300">
                                                        correct
                                                      </span>
                                                    ) : null}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }

                              if (item.kind === "quiz_attempt") {
                                const questions = parseTutorQuizQuestions(item.questions);

                                return (
                                  <div
                                    key={item.id}
                                    className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <MessageSquareText className="size-4 text-emerald-300" />
                                        <span className="text-sm font-medium text-slate-100">
                                          Quiz Answered
                                        </span>
                                        {item.objectiveIndex != null ? (
                                          <Badge tone="slate">
                                            objective {item.objectiveIndex + 1}
                                          </Badge>
                                        ) : null}
                                        <Badge tone="emerald">attempt</Badge>
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {formatDateTime(item.timestamp)}
                                      </span>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-slate-100">
                                      {item.title || "Untitled quiz attempt"}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                      Score {item.score ?? "N/A"} / {item.totalQuestions ?? "?"}
                                    </p>
                                    {questions.length > 0 ? (
                                      <div className="mt-4 space-y-3">
                                        {questions.map((question, index) => (
                                          <div
                                            key={question.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                                          >
                                            <div className="flex flex-wrap items-center gap-2">
                                              <p className="text-sm font-medium leading-6 text-slate-100">
                                                {`${index + 1}. ${question.prompt}`}
                                              </p>
                                              {question.isCorrect != null ? (
                                                <Badge
                                                  tone={
                                                    question.isCorrect ? "emerald" : "rose"
                                                  }
                                                >
                                                  {question.isCorrect ? "correct" : "incorrect"}
                                                </Badge>
                                              ) : null}
                                            </div>
                                            <div className="mt-3 space-y-2">
                                              {question.options.map((option) => {
                                                const isCorrectOption =
                                                  option.id === question.correctOptionId;
                                                const isSelectedOption =
                                                  option.id === question.selectedOptionId;

                                                return (
                                                  <div
                                                    key={`${question.id}-${option.id}`}
                                                    className={cn(
                                                      "rounded-xl border px-3 py-2 text-sm",
                                                      isCorrectOption && isSelectedOption
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                                                        : isSelectedOption
                                                          ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
                                                          : isCorrectOption
                                                            ? "border-sky-500/30 bg-sky-500/10 text-sky-100"
                                                            : "border-slate-800 bg-slate-900/70 text-slate-300",
                                                    )}
                                                  >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                      <span className="font-medium">
                                                        {option.id}.
                                                      </span>
                                                      <span>{option.text}</span>
                                                      {isSelectedOption ? (
                                                        <span className="text-xs uppercase tracking-[0.18em] text-amber-300">
                                                          selected
                                                        </span>
                                                      ) : null}
                                                      {isCorrectOption ? (
                                                        <span className="text-xs uppercase tracking-[0.18em] text-sky-300">
                                                          correct
                                                        </span>
                                                      ) : null}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                                              <span>
                                                Student answer:{" "}
                                                <span className="font-medium text-slate-100">
                                                  {question.selectedOptionId ?? "No answer"}
                                                </span>
                                              </span>
                                              {question.correctOptionId ? (
                                                <span>
                                                  Correct answer:{" "}
                                                  <span className="font-medium text-slate-100">
                                                    {question.correctOptionId}
                                                  </span>
                                                </span>
                                              ) : null}
                                            </div>
                                            {question.explanation ? (
                                              <p className="mt-3 text-sm leading-6 text-slate-400">
                                                {question.explanation}
                                              </p>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={item.id}
                                  className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 p-4"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="size-4 text-amber-300" />
                                      <span className="text-sm font-medium text-slate-100">
                                        Image Generated
                                      </span>
                                      {item.objectiveIndex != null ? (
                                        <Badge tone="slate">
                                          objective {item.objectiveIndex + 1}
                                        </Badge>
                                      ) : null}
                                      <Badge tone="amber">image</Badge>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                      {formatDateTime(item.timestamp)}
                                    </span>
                                  </div>
                                  {item.imageUrl ? (
                                    <a
                                      href={item.imageUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
                                    >
                                      <img
                                        src={item.imageUrl}
                                        alt={item.prompt || "Generated Saint Paul image"}
                                        loading="lazy"
                                        className="max-h-[320px] w-full object-contain"
                                      />
                                    </a>
                                  ) : null}
                                  <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {item.prompt || "No prompt stored"}
                                  </p>
                                  {item.source ? (
                                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                                      {item.source}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </SectionCard>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                      <SectionCard title="Interaction Events" eyebrow="Telemetry">
                        {eventsNewestFirst.length === 0 ? (
                          <EmptyPanel
                            title="No interaction events"
                            description="The events table does not contain entries for this session."
                          />
                        ) : (
                          <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                            {eventsNewestFirst.map((event) => (
                              <div
                                key={event.item_key}
                                className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-4"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge tone="sky">{event.event_type || "event"}</Badge>
                                  {event.tab ? <Badge tone="slate">{event.tab}</Badge> : null}
                                  {event.objective_index != null ? (
                                    <Badge tone="amber">{`objective ${event.objective_index + 1}`}</Badge>
                                  ) : null}
                                </div>
                                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                                  {formatDateTime(event.recorded_at || event.client_timestamp)}
                                </p>
                                {stringifyCompact(event.payload) ? (
                                  <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs leading-6 text-slate-300">
                                    {stringifyCompact(event.payload)}
                                  </pre>
                                ) : (
                                  <p className="mt-3 text-sm text-slate-500">No payload fields.</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </SectionCard>

                      <div className="space-y-6">
                        <SectionCard title="Quiz Artifacts" eyebrow="Generated Content">
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-sky-300" />
                                <h3 className="font-medium text-slate-100">Generated quizzes</h3>
                              </div>
                              {generatedQuizzesNewestFirst.length === 0 ? (
                                <EmptyPanel
                                  title="No generated quizzes"
                                  description="No AI-generated quiz artifacts were stored for this session."
                                />
                              ) : (
                                generatedQuizzesNewestFirst.map((artifact) => (
                                  <div
                                    key={artifact.item_key}
                                    className="rounded-[24px] border border-slate-800 bg-slate-900/60 p-4"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge tone="sky">quiz</Badge>
                                      {artifact.objective_index != null ? (
                                        <Badge tone="amber">{`objective ${artifact.objective_index + 1}`}</Badge>
                                      ) : null}
                                    </div>
                                    <p className="mt-3 font-medium text-slate-100">
                                      {artifact.title || "Untitled generated quiz"}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                      {formatDateTime(artifact.created_at)}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-300">
                                      {artifact.questions.length} questions
                                      {artifact.source ? ` • source: ${artifact.source}` : ""}
                                    </p>
                                    {artifact.error ? (
                                      <p className="mt-2 text-sm text-amber-200">
                                        Error: {artifact.error}
                                      </p>
                                    ) : null}
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <MessageSquareText className="size-4 text-emerald-300" />
                                <h3 className="font-medium text-slate-100">Quiz attempts</h3>
                              </div>
                              {quizAttemptsNewestFirst.length === 0 ? (
                                <EmptyPanel
                                  title="No quiz attempts"
                                  description="No graded AI quiz attempts were stored for this session."
                                />
                              ) : (
                                quizAttemptsNewestFirst.map((artifact) => (
                                  <div
                                    key={artifact.item_key}
                                    className="rounded-[24px] border border-slate-800 bg-slate-900/60 p-4"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge tone="emerald">attempt</Badge>
                                      {artifact.objective_index != null ? (
                                        <Badge tone="amber">{`objective ${artifact.objective_index + 1}`}</Badge>
                                      ) : null}
                                    </div>
                                    <p className="mt-3 font-medium text-slate-100">
                                      {artifact.title || "Untitled attempt"}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                      {formatDateTime(artifact.submitted_at)}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-300">
                                      Score {artifact.score ?? "N/A"} / {artifact.total_questions ?? "?"}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </SectionCard>

                        <SectionCard title="Images" eyebrow="Generated Visuals">
                          {generatedImagesNewestFirst.length === 0 ? (
                            <EmptyPanel
                              title="No generated images"
                              description="This session has no stored image artifacts."
                            />
                          ) : (
                            <div className="space-y-3">
                              {generatedImagesNewestFirst.map((artifact) => (
                                <div
                                  key={artifact.item_key}
                                  className="rounded-[24px] border border-slate-800 bg-slate-900/60 p-4"
                                >
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="size-4 text-sky-300" />
                                    <Badge tone="sky">image</Badge>
                                    {artifact.objective_index != null ? (
                                      <Badge tone="amber">{`objective ${artifact.objective_index + 1}`}</Badge>
                                    ) : null}
                                  </div>
                                  {artifact.asset_url ? (
                                    <a
                                      href={artifact.asset_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-4 block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
                                    >
                                      <img
                                        src={artifact.asset_url}
                                        alt={artifact.prompt || "Generated Saint Paul image"}
                                        loading="lazy"
                                        className="max-h-[480px] w-full object-contain"
                                      />
                                    </a>
                                  ) : null}
                                  <p className="mt-3 text-sm text-slate-400">
                                    {formatDateTime(artifact.created_at)}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {artifact.content_type ? (
                                      <Badge tone="slate">{artifact.content_type}</Badge>
                                    ) : null}
                                    {artifact.size_bytes != null ? (
                                      <Badge tone="slate">{`${formatNumber(artifact.size_bytes)} bytes`}</Badge>
                                    ) : null}
                                  </div>
                                  <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {artifact.prompt || "No prompt stored"}
                                  </p>
                                  {artifact.asset_url ? (
                                    <a
                                      href={artifact.asset_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-4 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
                                    >
                                      Open asset
                                      <ExternalLink className="size-4" />
                                    </a>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </SectionCard>

                        <SectionCard
                          title="Errors"
                          eyebrow="Exceptions"
                          action={
                            errorCount > 0 ? (
                              <Badge tone="rose">{`${errorCount} stored errors`}</Badge>
                            ) : null
                          }
                        >
                          {errorsNewestFirst.length === 0 ? (
                            <EmptyPanel
                              title="No stored errors"
                              description="The errors table does not have records for this session."
                            />
                          ) : (
                            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                              {errorsNewestFirst.map((error) => (
                                <div
                                  key={error.item_key}
                                  className="rounded-[24px] border border-rose-500/20 bg-rose-500/5 p-4"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <AlertTriangle className="size-4 text-rose-300" />
                                    {error.stage ? <Badge tone="rose">{error.stage}</Badge> : null}
                                    {error.error_scope ? (
                                      <Badge tone="amber">{error.error_scope}</Badge>
                                    ) : null}
                                  </div>
                                  <p className="mt-3 text-sm text-rose-100">
                                    {error.error_message || "No message stored"}
                                  </p>
                                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-rose-200/70">
                                    {formatDateTime(error.recorded_at)}
                                  </p>
                                  {stringifyCompact(error.metadata) ? (
                                    <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs leading-6 text-slate-300">
                                      {stringifyCompact(error.metadata)}
                                    </pre>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </SectionCard>
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </section>
          </div>
        ) : null}
      </div>

      {selectedCompletionRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-6 py-8 backdrop-blur-sm"
          onClick={() => setSelectedCompletionRowKey(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Included student IDs"
            className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-[0_24px_80px_rgba(2,6,23,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-800 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Included Student IDs
                  </p>
                  <p className="mt-2 font-[family:var(--font-outfit)] text-xl text-slate-100">
                    {[
                      selectedCompletionRow.subjectLabel,
                      selectedCompletionRow.versionLabel,
                      selectedCompletionRow.gradeLabel,
                      selectedCompletionRow.modeLabel,
                    ].join(" • ")}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {`${formatNumber(selectedCompletionRow.studentIds.length)} student IDs included in this row.`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700 bg-slate-950/80 text-slate-100 hover:bg-slate-800"
                  onClick={() => setSelectedCompletionRowKey(null)}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(80vh-140px)] overflow-y-auto p-5">
              <div className="flex flex-wrap gap-2">
                {selectedCompletionRow.studentIds.map((studentId) => (
                  <Badge key={studentId} tone="sky">
                    {studentId}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
