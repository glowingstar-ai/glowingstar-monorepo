"use client";

import { Check, ChevronDown, Copy } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ButtonHTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TeachingObjective = {
  topic: string;
  objectives: string[];
};

type TeachingObjectivesData = Record<
  string,
  Record<string, Record<string, TeachingObjective>>
>;

type InitialSelection = {
  grade?: string;
  mode?: string;
  subject?: string;
  version?: string;
};

type SaintPaulRouteBuilderProps = {
  data: TeachingObjectivesData;
  initialSelection: InitialSelection;
};

type SelectFieldProps = {
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
};

const SUBJECT_LABELS: Record<string, string> = {
  chemistry: "化學",
  geography: "地理",
  history: "歷史",
  physics: "物理",
};

const VERSION_LABELS: Record<string, string> = {
  formal: "正式",
  preliminary: "預備",
  unspecified: "單一版本",
};

const GRADE_LABELS: Record<string, string> = {
  F4: "高一",
  F5: "高二",
};

const MODE_OPTIONS = [
  {
    value: "quiz-only",
    label: "僅測驗",
    description: "學生只會看到測驗內容。",
  },
  {
    value: "quiz-plus-ai-tutor",
    label: "測驗加 AI 導師",
    description: "學生可使用測驗與 AI 導師輔助。",
  },
];

function getLabel(
  key: string,
  labels: Record<string, string>,
  fallback?: string,
): string {
  return labels[key] ?? fallback ?? key;
}

function normalizeFirstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function ActionButton({
  children,
  className,
  ...props
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>): JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
}: Readonly<SelectFieldProps>): JSX.Element {
  return (
    <label
      htmlFor={id}
      className="block rounded-2xl border border-[#DDD7CC] bg-white p-4"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6A63]">
        {label}
      </span>
      <div className="relative mt-3">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none bg-transparent pr-8 text-base font-semibold text-[#171717] outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6A63]"
          strokeWidth={1.8}
        />
      </div>
    </label>
  );
}

function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F4EE] px-4 py-3">
      <span className="text-sm text-[#6B6A63]">{label}</span>
      <span className="text-sm font-semibold text-[#171717]">{value}</span>
    </div>
  );
}

export default function SaintPaulRouteBuilder({
  data,
  initialSelection,
}: Readonly<SaintPaulRouteBuilderProps>): JSX.Element {
  const pathname = usePathname();
  const subjects = Object.keys(data);

  const [subject, setSubject] = useState(
    subjects.includes(initialSelection.subject ?? "")
      ? (initialSelection.subject as string)
      : (subjects[0] ?? ""),
  );
  const [version, setVersion] = useState(
    normalizeFirstValue(initialSelection.version) ?? "",
  );
  const [grade, setGrade] = useState(
    normalizeFirstValue(initialSelection.grade) ?? "",
  );
  const [mode, setMode] = useState(
    MODE_OPTIONS.some((option) => option.value === initialSelection.mode)
      ? (initialSelection.mode as string)
      : MODE_OPTIONS[0].value,
  );
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  const versions = Object.keys(data[subject] ?? {});
  const currentVersion = versions.includes(version)
    ? version
    : (versions[0] ?? "");
  const grades = Object.keys(data[subject]?.[currentVersion] ?? {});
  const currentGrade = grades.includes(grade) ? grade : (grades[0] ?? "");
  const selectedLesson =
    data[subject]?.[currentVersion]?.[currentGrade] ?? null;
  const selectedMode =
    MODE_OPTIONS.find((option) => option.value === mode) ?? MODE_OPTIONS[0];

  useEffect(() => {
    if (currentVersion !== version) {
      setVersion(currentVersion);
    }
  }, [currentVersion, version]);

  useEffect(() => {
    if (currentGrade !== grade) {
      setGrade(currentGrade);
    }
  }, [currentGrade, grade]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (currentVersion) params.set("version", currentVersion);
    if (currentGrade) params.set("grade", currentGrade);
    if (mode) params.set("mode", mode);

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [currentGrade, currentVersion, mode, pathname, subject]);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  const shareParams = new URLSearchParams({
    grade: currentGrade,
    mode,
    subject,
    version: currentVersion,
  });
  const sharePath = `${pathname}?${shareParams.toString()}`;
  const shareUrl = origin ? `${origin}${sharePath}` : sharePath;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (error) {
      console.error("無法複製分享連結", error);
    }
  };

  return (
    <main className="saint-paul-shell min-h-screen bg-[#F6F2EB] text-[#171717]">
      <header className="border-b border-[#E4DED2] bg-[#FBF8F2]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
              Saint Paul
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              Teacher Link Builder
            </p>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5F5D57]">
            用簡單表單設定學生入口，完成後直接生成與分享連結。
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">
        <section className="rounded-[28px] border border-[#DDD7CC] bg-[#FBF8F2] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
            Teacher Setup
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#171717] md:text-4xl">
            用 dropdown 快速建立學生連結
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5D57] md:text-base">
            依序選擇科目、版本、年級與模式，連結會即時更新。整個流程集中在同一個表單裡，老師不用在多個區塊之間切換。
          </p>

          <div className="mt-6 rounded-3xl border border-[#DDD7CC] bg-white p-5 md:p-6">
            <div className="grid gap-4 xl:grid-cols-4">
              <SelectField
                id="saint-paul-subject"
                label="科目"
                value={subject}
                onChange={setSubject}
                options={subjects.map((option) => ({
                  value: option,
                  label: getLabel(option, SUBJECT_LABELS),
                }))}
              />

              <SelectField
                id="saint-paul-version"
                label="版本"
                value={currentVersion}
                onChange={setVersion}
                options={versions.map((option) => ({
                  value: option,
                  label: getLabel(option, VERSION_LABELS),
                }))}
              />

              <SelectField
                id="saint-paul-grade"
                label="年級"
                value={currentGrade}
                onChange={setGrade}
                options={grades.map((option) => ({
                  value: option,
                  label: getLabel(option, GRADE_LABELS),
                }))}
              />

              <SelectField
                id="saint-paul-mode"
                label="模式"
                value={mode}
                onChange={setMode}
                options={MODE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </div>

            <div className="mt-5 border-t border-[#EEE9DF] pt-5">
              <p className="text-sm leading-6 text-[#5F5D57]">
                {selectedMode.description}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#DDD7CC] bg-white p-6 shadow-[0_8px_24px_rgba(23,23,23,0.04)] md:p-8">
          <div className="flex flex-col gap-3 border-b border-[#EEE9DF] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B6A63]">
                Live Link
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
                即時連結與內容預覽
              </h2>
            </div>

            <ActionButton onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={1.8} />
                  已複製連結
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" strokeWidth={1.8} />
                  複製連結
                </>
              )}
            </ActionButton>
          </div>

          <div className="mt-6">
            <div className="rounded-2xl bg-[#F7F4EE] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6A63]">
                分享連結
              </p>
              <p className="mt-3 break-all font-mono text-sm leading-7 text-[#171717]">
                {shareUrl}
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <SummaryRow
                label="科目"
                value={getLabel(subject, SUBJECT_LABELS)}
              />
              <SummaryRow
                label="版本"
                value={getLabel(currentVersion, VERSION_LABELS)}
              />
              <SummaryRow
                label="年級"
                value={getLabel(currentGrade, GRADE_LABELS)}
              />
              <SummaryRow label="模式" value={selectedMode.label} />
            </div>

            {selectedLesson ? (
              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
                <div className="rounded-2xl bg-[#F7F4EE] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6A63]">
                    Topic
                  </p>
                  <p className="mt-3 text-xl font-semibold leading-8 text-[#171717]">
                    {selectedLesson.topic}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B6A63]">
                    Objectives
                  </p>
                  <div className="mt-4 space-y-3">
                    {selectedLesson.objectives.map((objective, index) => (
                      <div
                        key={objective}
                        className="flex gap-4 rounded-2xl border border-[#EEE9DF] bg-[#FCFBF8] px-4 py-4"
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-7 text-[#4D4B45]">
                          {objective}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#D7D2C8] bg-[#FCFBF8] p-5 text-sm leading-7 text-[#5F5D57]">
                目前組合找不到對應課程。
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
