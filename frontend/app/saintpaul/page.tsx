import type { Metadata } from "next";
import SaintPaulRouteBuilder from "@/components/saint-paul-route-builder";
import teachingObjectives from "@/data/saintpaul/teaching_objectives.json";

export const metadata: Metadata = {
  title: "聖保祿學生連結產生器",
  description: "供老師設定科目、版本、年級與模式，產生可分享給學生的連結。",
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function normalizeSearchParams(
  searchParams: PageProps["searchParams"],
): Record<string, string | undefined> {
  return {
    grade: Array.isArray(searchParams?.grade)
      ? searchParams?.grade[0]
      : searchParams?.grade,
    mode: Array.isArray(searchParams?.mode)
      ? searchParams?.mode[0]
      : searchParams?.mode,
    subject: Array.isArray(searchParams?.subject)
      ? searchParams?.subject[0]
      : searchParams?.subject,
    version: Array.isArray(searchParams?.version)
      ? searchParams?.version[0]
      : searchParams?.version,
  };
}

export default function SaintPaulPage({
  searchParams,
}: Readonly<PageProps>): JSX.Element {
  return (
    <SaintPaulRouteBuilder
      data={teachingObjectives}
      initialSelection={normalizeSearchParams(searchParams)}
    />
  );
}
