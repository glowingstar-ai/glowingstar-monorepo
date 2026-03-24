import type { Metadata } from "next";
import LandingPage from "@/components/LandingPageLegacy";

export const metadata: Metadata = {
  title: "Original Landing Page",
  description: "The original GlowingStar landing page.",
};

export default function OriginalLandingPage(): JSX.Element {
  return <LandingPage />;
}
