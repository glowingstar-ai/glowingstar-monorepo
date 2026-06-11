import type { Metadata } from "next";
import Link from "next/link";
import { paperTextureDataUri } from "@/lib/paper-texture";

const CONTACT_EMAIL = "support@glowingstar.ai";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GlowingStar collects, uses, and protects information.",
};

const sections = [
  {
    heading: "Who we are",
    body: [
      "GlowingStar, Inc. (“GlowingStar”, “we”, “us”) builds an AI tutoring platform for schools and universities, together with the measurement infrastructure that records how learning sessions unfold. This policy describes how we handle information on glowingstar.ai and in our products.",
    ],
  },
  {
    heading: "Information we collect on this website",
    body: [
      "This website does not require an account and does not ask you for personal information to browse. If you contact us by email, we receive the information you choose to send (such as your name, email address, and message) and use it only to respond to you.",
    ],
  },
  {
    heading: "Information we collect in our products",
    body: [
      "Our learning platform records study-session data — such as tutor conversations, quiz attempts, confidence ratings, and interaction events — so that partner institutions can review learning outcomes. Deployments with schools and universities are governed by written agreements with those institutions, which control how student data is collected, stored, accessed, and retained.",
      "We do not sell personal information. Student data from institutional deployments is used to operate the product, report outcomes to the partner institution, and, where the agreement permits, conduct de-identified learning research.",
    ],
  },
  {
    heading: "Data storage and security",
    body: [
      "Product data is stored with established cloud infrastructure providers, encrypted in transit, and restricted to personnel who need it to operate the service. Research analyses use de-identified data wherever possible.",
    ],
  },
  {
    heading: "Your choices and contact",
    body: [
      `To ask about, correct, or delete information you believe we hold, email ${CONTACT_EMAIL}. Students and parents in institutional deployments can also direct requests through their school, which controls the deployment under its agreement with us.`,
    ],
  },
  {
    heading: "Changes",
    body: [
      "We will update this page when our practices change. This policy is effective as of June 10, 2026.",
    ],
  },
];

export default function PrivacyPage(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#ede6d9] text-[#17120f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_54%),linear-gradient(180deg,#f5efe3_0%,#ece2d2_48%,#e7ddce_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundImage: paperTextureDataUri,
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
        }}
      />
      <main className="relative mx-auto w-full max-w-3xl px-6 py-20 sm:px-10">
        <Link
          href="/"
          className="text-sm text-[#17120f]/55 underline decoration-[#17120f]/25 underline-offset-4 hover:text-[#17120f]"
        >
          ← Back to home
        </Link>
        <h1 className="mt-6 font-heading text-3xl sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#17120f]/55">
          Effective June 10, 2026
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-xl text-[#17120f]">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-3 text-base leading-8 text-[#17120f]/72"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
