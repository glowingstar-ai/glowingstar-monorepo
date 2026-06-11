import type { Metadata } from "next";
import HomeLandingPage from "@/components/HomeLandingPage";

export const metadata: Metadata = {
  title: "GlowingStar — AI learning programs with the evidence built in",
  description:
    "GlowingStar builds an AI tutoring platform for schools and universities and instruments every session — assessments, conversations, and student confidence — so institutions see measured learning outcomes.",
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GlowingStar, Inc.",
  url: "https://glowingstar.ai",
  logo: "https://glowingstar.ai/logo.png",
  description:
    "GlowingStar builds an AI tutoring platform for schools and universities and instruments every session, so institutions see measured learning outcomes instead of vendor claims.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@glowingstar.ai",
    contactType: "customer support",
  },
};

export default function Home(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <HomeLandingPage />
    </>
  );
}
