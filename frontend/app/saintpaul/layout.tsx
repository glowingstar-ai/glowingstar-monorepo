import type { ReactNode } from "react";
import SaintPaulStudyGate from "@/components/saint-paul-study-gate";

export default function SaintPaulLayout({
  children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
  return <SaintPaulStudyGate>{children}</SaintPaulStudyGate>;
}
