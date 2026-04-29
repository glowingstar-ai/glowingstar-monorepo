export type TeachingObjective = {
  topic: string;
  objectives: string[];
};

export type TeachingObjectivesData = Record<
  string,
  Record<string, Record<string, TeachingObjective>>
>;

export type SaintPaulSelection = {
  grade?: string;
  mode?: string;
  subject?: string;
  version?: string;
};

export const SUBJECT_LABELS: Record<string, string> = {
  chemistry: "化學",
  geography: "地理",
  history: "歷史",
  physics: "物理",
};

export const VERSION_LABELS: Record<string, string> = {
  formal: "正式",
  preliminary: "預備",
  unspecified: "單一版本",
};

export const GRADE_LABELS: Record<string, string> = {
  F4: "高一",
  F5: "高二",
};

export const MODE_OPTIONS = [
  {
    value: "quiz-only",
    label: "僅測驗",
    description: "學生只會看到測驗內容。",
  },
  {
    value: "quiz-plus-ai-tutor",
    label: "測驗加智慧導學",
    description: "學生可使用測驗與智慧導學輔助。",
  },
] as const;

export function getLabel(
  key: string,
  labels: Record<string, string>,
  fallback?: string,
): string {
  return labels[key] ?? fallback ?? key;
}

export function normalizeFirstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function normalizeSaintPaulSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): SaintPaulSelection {
  return {
    grade: normalizeFirstValue(searchParams?.grade),
    mode: normalizeFirstValue(searchParams?.mode),
    subject: normalizeFirstValue(searchParams?.subject),
    version: normalizeFirstValue(searchParams?.version),
  };
}

export function buildSaintPaulQueryString(
  selection: SaintPaulSelection,
): string {
  const params = new URLSearchParams();

  if (selection.subject) params.set("subject", selection.subject);
  if (selection.version) params.set("version", selection.version);
  if (selection.grade) params.set("grade", selection.grade);
  if (selection.mode) params.set("mode", selection.mode);

  return params.toString();
}
