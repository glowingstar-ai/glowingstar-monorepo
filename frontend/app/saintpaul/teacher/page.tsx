import type { Metadata } from "next";
import SaintPaulRouteBuilder from "@/components/saint-paul-route-builder";
import saintPaulQuizBank from "@/data/saintpaul/all_quizzes.json";
import { normalizeSaintPaulSearchParams } from "@/lib/saint-paul";
import { buildTeachingObjectivesData } from "@/lib/saint-paul-quiz-bank";

export const metadata: Metadata = {
  title: "聖保祿老師連結產生器",
  description: "供老師設定科目、版本、年級與模式，產生可分享給學生的連結。",
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SaintPaulTeacherPage({
  searchParams,
}: Readonly<PageProps>): JSX.Element {
  const teachingObjectives = buildTeachingObjectivesData(saintPaulQuizBank);

  return (
    <SaintPaulRouteBuilder
      data={teachingObjectives}
      initialSelection={normalizeSaintPaulSearchParams(searchParams)}
    />
  );
}
