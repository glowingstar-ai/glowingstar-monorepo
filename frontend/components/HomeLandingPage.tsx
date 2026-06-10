import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { teamLogoList } from "@/lib/site-content";
import { paperTextureDataUri } from "@/lib/paper-texture";

const CONTACT_EMAIL = "support@glowingstar.ai";
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

const navLinks = [
  { href: "#about", label: "What we do" },
  { href: "#product", label: "Product" },
  { href: "#evidence", label: "Evidence" },
  { href: "#team", label: "Team" },
  { href: "#contact", label: "Contact" },
];

const productPillars = [
  {
    name: "Tutor Mode Studio",
    kicker: "Multi-agent learning design",
    description:
      "Students describe what they want to learn and a manager agent coordinates four specialists — a curriculum strategist, a modality researcher, an assessment architect, and a progress coach — to produce a structured tutoring plan. Live tutor chat enriches each learning objective with generated visual explanations and on-demand practice quizzes with immediate feedback.",
  },
  {
    name: "Classroom deployment",
    kicker: "Built for real schools",
    description:
      "Teachers generate shareable session links that control subject, grade level, and study mode, and students move through a pre-test, AI-tutor, and post-test workflow. The platform runs as real coursework — our first school deployment operated across four subjects in Traditional Chinese at a Hong Kong secondary school.",
  },
  {
    name: "Evidence & calibration layer",
    kicker: "Measurement, not vendor claims",
    description:
      "Every tutor message, quiz attempt, and per-item student confidence rating is captured end-to-end. Research dashboards give educators cohort-level overviews and per-session drill-down, so institutions can see what the AI said, what students attempted, and how confidence tracked correctness.",
  },
  {
    name: "Assessment beyond multiple choice",
    kicker: "Richer signals of understanding",
    description:
      "The platform extends past quiz scores into realtime voice sessions and a structured oral-defense workflow — built with university students — where learners defend their reasoning against AI-generated probing questions. Measuring learning means measuring more than a final score.",
  },
];

const evidenceStats = [
  { value: "323", label: "students in our first school deployment" },
  { value: "4", label: "subjects, taught in Traditional Chinese" },
  { value: "2,751", label: "student–tutor conversations" },
  { value: "253k", label: "interaction events logged" },
];

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GlowingStar, Inc.",
  url: "https://glowingstar.ai",
  logo: "https://glowingstar.ai/logo.png",
  description:
    "GlowingStar builds an AI tutoring platform for schools and universities and instruments every session, so institutions see measured learning outcomes instead of vendor claims.",
  founder: {
    "@type": "Person",
    name: "Charlie Chenyu Zhang",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: CONTACT_EMAIL,
    contactType: "customer support",
  },
};

export const homeMetadata: Metadata = {
  title: "GlowingStar — AI learning programs with the evidence built in",
  description:
    "GlowingStar builds an AI tutoring platform for schools and universities and instruments every session — assessments, conversations, and student confidence — so institutions see measured learning outcomes.",
};

const cardClass =
  "rounded-[2rem] border border-[#17120f]/12 bg-[linear-gradient(180deg,rgba(252,247,239,0.9),rgba(245,237,225,0.94))] shadow-[0_20px_60px_rgba(93,66,35,0.08)]";

const kickerClass = "text-xs uppercase tracking-[0.34em] text-[#17120f]/58";

export default function HomeLandingPage(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#ede6d9] text-[#17120f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_54%),linear-gradient(180deg,#f5efe3_0%,#ece2d2_48%,#e7ddce_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(255,255,255,0.55), transparent 34%), radial-gradient(circle at bottom right, rgba(154,130,99,0.14), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.28), rgba(237,230,217,0.08) 46%, rgba(188,168,142,0.12) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundImage: paperTextureDataUri,
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
        }}
      />

      <header className="sticky top-0 z-30 border-b border-[#17120f]/10 bg-[rgba(245,239,227,0.88)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="GlowingStar"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain drop-shadow-[0_4px_12px_rgba(235,179,43,0.18)]"
            />
            <span className="font-heading text-sm uppercase tracking-[0.28em] text-[#17120f]/70">
              GlowingStar
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#17120f]/65 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#17120f]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={CONTACT_HREF}
            className="rounded-full border border-[#17120f]/15 bg-[rgba(255,252,247,0.85)] px-4 py-2 text-sm font-medium text-[#17120f] shadow-[0_8px_20px_rgba(93,66,35,0.1)] transition-colors hover:bg-[#fffaf1]"
          >
            Get in touch
          </a>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
        {/* Hero */}
        <section className="max-w-3xl">
          <p className={`font-heading ${kickerClass}`}>
            AI-Native Learning, Measured
          </p>
          <h1 className="mt-5 font-heading text-4xl leading-tight sm:text-5xl lg:text-[3.4rem]">
            AI learning programs with the evidence built in.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#17120f]/72 sm:text-xl sm:leading-9">
            GlowingStar builds an AI tutoring platform for schools and
            universities — and instruments every session, from assessments to
            conversations to student confidence — so institutions see measured
            learning outcomes instead of vendor claims.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={CONTACT_HREF}
              className="rounded-full bg-[#17120f] px-6 py-3 text-sm font-medium text-[#f5efe3] shadow-[0_16px_40px_rgba(23,18,15,0.25)] transition-opacity hover:opacity-90"
            >
              Partner with us
            </a>
            <Link
              href="/manifesto"
              className="rounded-full border border-[#17120f]/18 bg-[rgba(255,252,247,0.8)] px-6 py-3 text-sm font-medium text-[#17120f] transition-colors hover:bg-[#fffaf1]"
            >
              Read our manifesto
            </Link>
          </div>
        </section>

        {/* What we do */}
        <section id="about" className="mt-20 scroll-mt-24 space-y-6">
          <div className={`${cardClass} px-6 py-8 sm:px-8`}>
            <p className={kickerClass}>The problem</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-[2rem]">
              AI tutoring is everywhere. Evidence that it works is not.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#17120f]/72 sm:text-lg">
              Generic AI study tools are now free and ubiquitous, but the
              question that matters to schools and universities — did students
              actually learn, or just feel like they did — goes almost entirely
              unmeasured. In our own classroom research, students who studied
              with an AI tutor scored no better than students who only
              practiced with quizzes, yet were measurably more confident on the
              answers they got wrong. Institutions adopting AI deserve
              instrumentation that can catch exactly that.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className={`${cardClass} px-6 py-8 sm:px-8`}>
              <p className={kickerClass}>What we do</p>
              <p className="mt-5 text-base leading-8 text-[#17120f]/72 sm:text-lg">
                We design and operate AI-native learning programs for partner
                institutions: a multi-agent tutoring system, teacher-controlled
                classroom deployment, pre/post assessment, and full interaction
                telemetry. Every deployment runs like a study, and every claim
                we make is backed by session-level data.
              </p>
            </div>
            <div className={`${cardClass} px-6 py-8 sm:px-8`}>
              <p className={kickerClass}>Our mission</p>
              <p className="mt-5 text-base leading-8 text-[#17120f]/72 sm:text-lg">
                Every student is a glowing star — our job is to help them
                shine. We exist to make AI teaching trustworthy: learning that
                is measured, not assumed, so institutions can adopt AI with
                evidence instead of faith.
              </p>
            </div>
          </div>
        </section>

        {/* Product */}
        <section id="product" className="mt-20 scroll-mt-24">
          <p className={kickerClass}>Product</p>
          <h2 className="mt-4 max-w-2xl font-heading text-2xl sm:text-[2rem]">
            One platform, from tutoring plan to verified outcome.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {productPillars.map((pillar) => (
              <div key={pillar.name} className={`${cardClass} px-6 py-8 sm:px-8`}>
                <p className={kickerClass}>{pillar.kicker}</p>
                <h3 className="mt-3 font-heading text-xl sm:text-2xl">
                  {pillar.name}
                </h3>
                <p className="mt-4 text-base leading-8 text-[#17120f]/70">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-[#17120f]/60">
            Want to see it in action?{" "}
            <Link
              href="/tutor-mode"
              className="font-medium text-[#17120f] underline decoration-[#17120f]/30 underline-offset-4"
            >
              Try Tutor Mode Studio
            </Link>{" "}
            — or{" "}
            <a
              href={CONTACT_HREF}
              className="font-medium text-[#17120f] underline decoration-[#17120f]/30 underline-offset-4"
            >
              email us
            </a>{" "}
            for a guided walkthrough of a classroom deployment.
          </p>
        </section>

        {/* Evidence */}
        <section id="evidence" className="mt-20 scroll-mt-24">
          <div className={`${cardClass} px-6 py-10 sm:px-8`}>
            <p className={kickerClass}>Evidence</p>
            <h2 className="mt-4 max-w-2xl font-heading text-2xl sm:text-[2rem]">
              We run every deployment like a study.
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {evidenceStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#17120f]/8 bg-[rgba(255,252,247,0.78)] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]"
                >
                  <p className="font-heading text-3xl text-[#b57900] sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#17120f]/65">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-3xl text-base leading-8 text-[#17120f]/72">
              Our first school deployment ran as real coursework at a Hong Kong
              secondary school: roughly 1,150 study sessions across physics,
              chemistry, geography, and history, each with pre- and post-tests
              and per-question confidence ratings. We compared quiz-only
              practice against quiz-plus-AI-tutor within the same students —
              and we report the results honestly, including the inconvenient
              ones. Both groups improved similarly on test scores, and students
              were more confident on the answers they got wrong in AI-tutored
              subjects. That calibration risk is precisely what our
              measurement layer exists to catch, and it is why institutions
              should demand evidence from any AI learning tool they adopt —
              including ours.
            </p>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="mt-20 scroll-mt-24 space-y-6">
          <p className={kickerClass}>Team</p>
          <h2 className="mt-4 max-w-2xl font-heading text-2xl sm:text-[2rem]">
            Builder-researchers.
          </h2>
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <div className={`${cardClass} px-6 py-8 sm:px-8`}>
              <p className="text-base leading-8 text-[#17120f]/72 sm:text-lg">
                GlowingStar was founded by{" "}
                <span className="font-semibold">Charlie Chenyu Zhang</span>,
                and is built by a team with backgrounds spanning Harvard, MIT,
                Stanford, and the University of Toronto, including work through
                the MIT Media Lab and the Harvard Innovation Labs. The same
                people who ship the tutoring engine and the teacher dashboards
                also design the classroom studies, run the statistical
                analysis, and write up the findings — caveats included.
              </p>
              <div className="mt-6 border-t border-[#17120f]/10 pt-5">
                <p className="font-heading text-lg text-[#17120f]">
                  &ldquo;Every student is a glowing star. Our job is to help
                  them shine.&rdquo;
                </p>
                <p className="mt-2 text-sm text-[#17120f]/60">
                  Charlie Chenyu Zhang, Founder &amp; CEO
                </p>
              </div>
            </div>
            <div className={`${cardClass} px-6 py-8 sm:px-8`}>
              <p className={kickerClass}>Team From</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {teamLogoList.map((logo) => (
                  <div
                    key={logo.alt}
                    className="flex h-20 items-center justify-center rounded-2xl border border-[#17120f]/8 bg-[rgba(255,252,247,0.78)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_18px_35px_rgba(87,63,35,0.08)]"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={120}
                      height={48}
                      loading="eager"
                      className={`max-h-10 w-auto object-contain opacity-100 ${logo.className ?? ""} ${"imageClassName" in logo ? logo.imageClassName ?? "" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-20 scroll-mt-24">
          <div className={`${cardClass} px-6 py-10 text-center sm:px-8`}>
            <p className={kickerClass}>Contact</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-[2rem]">
              Bring measured AI learning to your institution.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#17120f]/72 sm:text-lg">
              We are onboarding a small number of partner schools and
              universities for upcoming terms. Whether you are an educator, a
              researcher, or an investor, we would love to hear from you.
            </p>
            <a
              href={CONTACT_HREF}
              className="mt-7 inline-block rounded-full bg-[#17120f] px-7 py-3 text-sm font-medium text-[#f5efe3] shadow-[0_16px_40px_rgba(23,18,15,0.25)] transition-opacity hover:opacity-90"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-[#17120f]/10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-6 py-10 text-center text-sm text-[#17120f]/55 sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 GlowingStar, Inc. All rights reserved.</p>
          <nav className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/manifesto" className="hover:text-[#17120f]">
              Manifesto
            </Link>
            <Link href="/law" className="hover:text-[#17120f]">
              For law firms
            </Link>
            <Link href="/privacy" className="hover:text-[#17120f]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#17120f]">
              Terms
            </Link>
            <a href={CONTACT_HREF} className="hover:text-[#17120f]">
              {CONTACT_EMAIL}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
