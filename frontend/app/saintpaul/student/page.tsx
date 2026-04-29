import type { Metadata } from "next";
import SaintPaulStudentExperience from "@/components/saint-paul-student-experience";
import teachingObjectives from "@/data/saintpaul/teaching_objectives.json";
import {
  GRADE_LABELS,
  getLabel,
  MODE_OPTIONS,
  normalizeSaintPaulSearchParams,
  SUBJECT_LABELS,
  VERSION_LABELS,
} from "@/lib/saint-paul";

export const metadata: Metadata = {
  title: "聖保祿學生頁面",
  description: "學生學習流程頁面，包含測驗與智慧導學。",
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SaintPaulStudentPage({
  searchParams,
}: Readonly<PageProps>): JSX.Element {
  const selection = normalizeSaintPaulSearchParams(searchParams);
  const subject = selection.subject ?? "";
  const version = selection.version ?? "";
  const grade = selection.grade ?? "";
  const selectedLesson =
    teachingObjectives[subject]?.[version]?.[grade] ?? null;
  const selectedMode =
    MODE_OPTIONS.find((option) => option.value === selection.mode) ??
    MODE_OPTIONS[0];

  const topicLabel = selectedLesson
    ? `${getLabel(subject, SUBJECT_LABELS)} · ${getLabel(version, VERSION_LABELS)} · ${getLabel(grade, GRADE_LABELS)}`
    : "未提供有效課程設定";

  return (
    <SaintPaulStudentExperience
      lesson={selectedLesson}
      mode={selectedMode.value}
      modeLabel={selectedMode.label}
      topicLabel={topicLabel}
    />
  );
}
