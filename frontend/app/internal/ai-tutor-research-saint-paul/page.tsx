import type { Metadata } from "next";

import SaintPaulResearchDashboard from "@/components/saint-paul-research-dashboard";

export const metadata: Metadata = {
  title: "Saint Paul AI Tutor Research",
  description:
    "Internal dashboard for reviewing Saint Paul student sessions, quiz submissions, tutor interactions, and generated artifacts.",
};

export default function InternalSaintPaulResearchPage(): JSX.Element {
  return <SaintPaulResearchDashboard />;
}
