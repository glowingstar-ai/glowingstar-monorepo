import type { Metadata } from "next";
import SaintPaulRouteBuilder from "@/components/saint-paul-route-builder";
import teachingObjectives from "@/data/saintpaul/teaching_objectives.json";
import { normalizeSaintPaulSearchParams } from "@/lib/saint-paul";

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
  return (
    <SaintPaulRouteBuilder
      data={teachingObjectives}
      initialSelection={normalizeSaintPaulSearchParams(searchParams)}
    />
  );
}
