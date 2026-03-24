import type { Metadata } from "next";

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
  paperTextureSvg
)}")`;

const sections: ManifestoSection[] = [
  {
    heading: "A New Kind of Institution",
    paragraphs: [
      "Knowledge is no longer scarce. Access is no longer the main bottleneck. The challenge now is helping people learn continuously, think clearly, stay grounded, and use AI responsibly in a world where every learner will have intelligent support close at hand.",
      "That requires a different institution. Not a traditional university with AI bolted on. Not a digital campus that simply automates lectures, assignments, and grading. An AI-native university is designed from the ground up for co-creation, judgment, and lifelong growth.",
    ],
  },
  {
    heading: "A New Social Contract",
    paragraphs: [
      "The old model fit a slower world: students received content, teachers delivered it, schools certified it, and society decided what counted. That world assumed knowledge changed gradually and institutions could update themselves slowly without losing relevance.",
      "In the GenAI era, the learner becomes the owner of a living learning journey. Memorization matters less than the ability to ask better questions, evaluate evidence, synthesize insight, collaborate across disciplines, and turn ideas into real-world impact.",
      "Teachers do not disappear. Their role becomes more important and more human: learning architect, mentor, coach, and guardian of standards. Institutions become trusted platforms for human development rather than gatekeepers of scarce knowledge.",
    ],
  },
  {
    heading: "Learning Across a Lifetime",
    paragraphs: [
      "Education can no longer be treated as a phase at the beginning of life. Careers are longer, less linear, and more unstable. The ability to learn, unlearn, and relearn is becoming more valuable than any static body of knowledge.",
      "An AI-native university should be a lifelong relationship. It should support learners through school, work, career transitions, entrepreneurship, leadership, and reinvention. Continuous learning is not a slogan. It is the core product.",
      "At the center of that model sits a personal learning context layer: a living record of goals, strengths, struggles, preferences, constraints, and growth. It is more than a transcript or dashboard. It is a map of who the learner is becoming, and it should belong to the learner.",
    ],
  },
  {
    heading: "A Faculty of Humans and Agents",
    paragraphs: [
      "On top of that context sits a new kind of faculty: specialized AI agents working under human guidance. One agent can transform trusted material into adaptive lessons and simulations. Another can keep the curriculum current. Another can coach motivation, reflection, and momentum. Another can track mastery and recommend the next stretch of work.",
      "These systems expand what good teaching can look like at scale, but they do not replace educators. Humans remain responsible for standards, ethics, interpretation, mentorship, and the design of meaningful learning experiences.",
    ],
  },
  {
    heading: "Speed With Depth",
    paragraphs: [
      "The promise is not convenience for its own sake. It is a dramatic reduction in the time between curiosity and capability. AI can compress feedback loops from weeks to moments, helping learners practice more, get explanations in the right form, and progress at a pace that is demanding without becoming crushing.",
      "But speed alone is not enough. Emotion, motivation, confidence, and belonging shape whether learning actually sticks. A serious learning system must be affect-aware without becoming invasive or manipulative. It should support the inner conditions that make growth possible.",
      "Learning should feel rewarding, not punitive. It can be rigorous without being deadening. The point is not to remove challenge. The point is to make challenge meaningful, visible, and energizing.",
    ],
  },
  {
    heading: "Social, Ethical, and Real",
    paragraphs: [
      "An AI-native university cannot become a solitary tutoring machine. Humans are social animals. We learn through dialogue, apprenticeship, collaboration, critique, and shared purpose. AI should reduce administrative friction so human time can shift toward mentorship, studio work, community, and conversation.",
      "Real-world contribution must be part of the curriculum. Learners should build products, conduct research, support organizations, and work on real problems early and often. This is where motivation deepens and ethics becomes concrete.",
      "The goal is not simply employability. It is whole-person flourishing: people who are more grounded, capable, connected, resilient, and able to contribute with dignity.",
    ],
  },
  {
    heading: "Trust, Judgment, and What Comes Next",
    paragraphs: [
      "Assessment must evolve. When AI can generate polished outputs in seconds, the final artifact alone no longer proves understanding. What matters is how learners frame problems, verify claims, document reasoning, navigate uncertainty, and use AI responsibly.",
      "Trust is part of the product. A persistent learning context is only legitimate if learners understand what is stored, why it exists, how it is used, and how it can be corrected, exported, or deleted. Without trust, personalization becomes surveillance.",
      "The goal is not to create students who merely survive the AI era. The goal is to cultivate people who can collaborate with AI without surrendering judgment, move faster without becoming shallower, and create value without losing care, character, or agency.",
      "Not education as compliance. Education as awakening. Not credentials alone. Capability with character. Not narrow achievement. Whole-person flourishing. This is the university the AI era demands.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "A concise vision for an AI-native university built for lifelong learning, judgment, and human flourishing.",
};

export default function ManifestoPage(): JSX.Element {
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
            <p className="font-heading text-xs uppercase tracking-[0.34em] text-[#17120f]/45">
              Manifesto
            </p>
            <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
              The AI-Native University Manifesto
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#17120f]/70">
              Learning faster. Living fuller. Becoming more human.
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
        </article>
      </main>
    </div>
  );
}
