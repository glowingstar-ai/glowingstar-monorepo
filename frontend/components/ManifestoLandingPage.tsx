import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { teamLogoList } from "@/lib/site-content";

type ManifestoSection = {
  heading: string;
  paragraphs: string[];
};

const paperTextureSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <defs>
      <filter id="paper-clouds">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.055"
          numOctaves="2"
          seed="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <filter id="paper-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.92"
          numOctaves="3"
          seed="11"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
    <rect width="240" height="240" fill="#f4eee2" />
    <rect width="240" height="240" filter="url(#paper-clouds)" opacity="0.12" />
    <rect width="240" height="240" filter="url(#paper-grain)" opacity="0.08" />
    <g
      transform="rotate(-8 120 120)"
      fill="none"
      stroke="#b19b7a"
      stroke-linecap="round"
      stroke-width="0.65"
      opacity="0.22"
    >
      <path d="M-20 28 C 36 10 72 40 126 22 S 206 12 268 30" />
      <path d="M-24 64 C 22 42 70 76 128 58 S 208 52 272 72" />
      <path d="M-18 104 C 40 84 78 120 136 98 S 212 92 274 112" />
      <path d="M-24 142 C 26 122 72 154 132 138 S 214 128 278 148" />
      <path d="M-16 182 C 34 164 82 198 142 176 S 220 170 282 190" />
      <path d="M-20 220 C 38 200 84 232 144 214 S 224 208 286 228" />
    </g>
    <g
      transform="rotate(-8 120 120)"
      fill="none"
      stroke="#fffaf1"
      stroke-linecap="round"
      stroke-width="0.8"
      opacity="0.25"
    >
      <path d="M8 18 C 58 8 110 28 162 12 S 226 14 258 8" />
      <path d="M14 88 C 56 74 116 102 172 82 S 226 80 260 92" />
      <path d="M0 154 C 46 142 104 164 158 146 S 220 146 252 160" />
      <path d="M4 208 C 54 194 112 220 166 202 S 224 198 258 214" />
    </g>
  </svg>
`
  .trim()
  .replace(/\s{2,}/g, " ");

const paperTextureDataUri = `url("data:image/svg+xml,${encodeURIComponent(
  paperTextureSvg,
)}")`;

const sections: ManifestoSection[] = [
  {
    heading: "Human Capability Is a Frontier",
    paragraphs: [
      "GlowingStar is a frontier lab for human learning. We build and study AI learning systems with a long-term ambition: to expand what people can understand, create, and do.",
      "As machines become more capable, we believe human learning deserves the same depth of ambition. Progress should mean more people able to ask good questions, reason through uncertainty, and contribute ideas of their own.",
    ],
  },
  {
    heading: "Build for the Person Who Is Learning",
    paragraphs: [
      "An answer can resolve a question. A learning experience should help someone handle the next question with greater understanding. We design around that ambition, creating opportunities to practice, explain, receive feedback, and try again.",
      "Our work begins with AI tutoring and assessment. We want these systems to adapt to learners while preserving the effort, curiosity, and reflection through which capability develops.",
    ],
  },
  {
    heading: "Bring Research Into Practice",
    paragraphs: [
      "We connect building with studying how people learn. Classroom deployments bring our systems into real learning settings, where teachers, students, and researchers can help identify what works, what breaks, and what deserves a closer look.",
      "Our standard is to test our assumptions, make limitations clear, and let the evidence shape the next iteration. A promising interaction is a starting point for investigation. Durable learning remains something to demonstrate.",
    ],
  },
  {
    heading: "Protect Independent Judgment",
    paragraphs: [
      "We want people to collaborate with AI while remaining able to question it. That means practicing how to check a claim, explain a choice, recognize uncertainty, and decide when an answer needs more scrutiny.",
      "Assessment should help us understand those abilities. Alongside answers and scores, we study the learning process: the questions people ask, the reasoning they share, and how their confidence relates to their understanding.",
    ],
  },
  {
    heading: "Keep Learning Across a Lifetime",
    paragraphs: [
      "Our horizon extends beyond a course or a credential. We want learning systems to support people as they enter new fields, take on harder problems, and find new directions throughout their lives.",
      "That requires attention to motivation, confidence, and belonging alongside intellectual rigor. Our goal is to make meaningful challenge more accessible and help people build the capacity to keep learning.",
    ],
  },
  {
    heading: "Keep People in Control",
    paragraphs: [
      "Learners should have a meaningful role in setting their goals and choosing how to pursue them. Educators should retain responsibility for standards, interpretation, and the human relationships at the center of teaching.",
      "We believe useful personalization depends on trust. People should understand what information a learning system uses and why, and have clear ways to question its guidance. Agency is a design principle we intend to carry through every stage of our work.",
    ],
  },
  {
    heading: "Build This Future Together",
    paragraphs: [
      "Human learning grows through conversation, mentorship, collaboration, and shared work. We want AI to strengthen those relationships and create more room for people to learn with and from one another.",
      "This work calls for researchers, educators, builders, and learners to shape it together. We invite people who share our ambition to help us explore what learning can become, and what it will take to make that future useful to more people.",
    ],
  },
];

export const manifestoMetadata: Metadata = {
  title: "Human Learning Manifesto",
  description:
    "GlowingStar is a frontier lab for human learning. We work to ensure that as machines get smarter, humans do too.",
};

export default function ManifestoLandingPage(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#ede6d9] text-[#17120f]">
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

      <main className="relative mx-auto flex min-h-screen w-full max-w-3xl px-6 py-20 sm:px-10 sm:py-24 lg:py-28">
        <article className="w-full">
          <header className="border-b border-[#17120f]/10 pb-10">
            <Link
              href="/"
              aria-label="GlowingStar home"
              className="inline-flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt="GlowingStar"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain drop-shadow-[0_4px_12px_rgba(235,179,43,0.18)]"
              />
              <p className="font-heading text-xs uppercase tracking-[0.34em] text-[#17120f]/45">
                Manifesto
              </p>
            </Link>
            <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
              A Frontier Lab for Human Learning
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#17120f]/70">
              We work to ensure that as machines get smarter, humans do too.
            </p>
          </header>

          <div className="space-y-12 pb-12 pt-12">
            {sections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="font-heading text-2xl text-[#17120f]">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[#17120f]/78 sm:text-[1.05rem] sm:leading-9"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <footer className="space-y-8 border-t border-[#17120f]/10 pt-12">
            <section className="rounded-[2rem] border border-[#17120f]/12 bg-[linear-gradient(180deg,rgba(252,247,239,0.86),rgba(245,237,225,0.92))] px-6 py-8 shadow-[0_20px_60px_rgba(93,66,35,0.08)] sm:px-8">
              <p className="text-xs uppercase tracking-[0.34em] text-[#17120f]/58">
                Team backgrounds
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                      className={`max-h-10 w-auto object-contain opacity-100 ${logo.className ?? ""} ${"imageClassName" in logo ? (logo.imageClassName ?? "") : ""}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#17120f]/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.9),rgba(243,234,220,0.92))] px-6 py-8 shadow-[0_24px_70px_rgba(107,79,45,0.08)] sm:px-8">
              <p className="text-xs uppercase tracking-[0.34em] text-[#17120f]/45">
                GlowingStar
              </p>
              <h2 className="mt-4 font-heading text-2xl text-[#17120f] sm:text-[2rem]">
                Explore the frontier with us
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#17120f]/72 sm:text-[1.05rem]">
                We welcome researchers, educators, builders, and institutions
                who want to help advance human learning. Tell us what you’re
                exploring and where our work might meet.
              </p>
              <div className="mt-6">
                <a
                  href="mailto:support@glowingstar.ai"
                  className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#17120f]/10 bg-[#17120f] px-6 py-3 text-sm font-semibold text-[#f6efe4] transition hover:bg-[#2b211b]"
                >
                  <span>Start a conversation</span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </section>
          </footer>
        </article>
      </main>
    </div>
  );
}
