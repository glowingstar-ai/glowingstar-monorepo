import type { Metadata } from "next";
import HomeLandingPage from "@/components/HomeLandingPage";

export const metadata: Metadata = {
  title: { absolute: "GlowingStar | Frontier Lab for Human Learning" },
  description:
    "We work to ensure that as machines get smarter, humans do too. GlowingStar is a frontier lab for human learning, bringing research and applied AI together to advance human potential.",
  alternates: { canonical: "https://glowingstar.ai" },
  openGraph: {
    title: "GlowingStar | Frontier Lab for Human Learning",
    description:
      "We work to ensure that as machines get smarter, humans do too.",
    url: "https://glowingstar.ai",
    siteName: "GlowingStar",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GlowingStar | Frontier Lab for Human Learning",
    description:
      "We work to ensure that as machines get smarter, humans do too.",
  },
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GlowingStar, Inc.",
  url: "https://glowingstar.ai",
  logo: "https://glowingstar.ai/logo.png",
  description:
    "GlowingStar is a frontier lab for human learning. We work to ensure that as machines get smarter, humans do too.",
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
