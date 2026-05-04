import type { Metadata } from "next";
import Image from "next/image";
import { teamLogoList } from "@/lib/site-content";

const LAW_CONTACT_EMAIL = "chenyu@glowingstar.ai";
const LAW_CONTACT_HREF = `mailto:${LAW_CONTACT_EMAIL}`;

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

export const lawMetadata: Metadata = {
  title: "Law Firms",
  description:
    "GlowingStar helps law firms package proprietary legal workflows into encrypted AI skills that staff can run securely against real case documents.",
};

export default function LawLandingPage(): JSX.Element {
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

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-24 lg:py-28">
        <div className="w-full">
          <section className="border-b border-[#17120f]/10 pb-14">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#17120f]/8 bg-[rgba(255,250,242,0.72)] px-3 py-2">
                <Image
                  src="/logo.png"
                  alt="GlowingStar"
                  width={40}
                  height={40}
                  priority
                  className="h-10 w-10 object-contain drop-shadow-[0_4px_12px_rgba(235,179,43,0.18)]"
                />
                <p className="font-heading text-xs uppercase tracking-[0.34em] text-[#17120f]/45">
                  GlowingStar
                </p>
              </div>

              <h1 className="mt-5 max-w-4xl font-heading text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Package your firm&rsquo;s legal workflows into secure AI skills.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#17120f]/72 sm:text-xl sm:leading-9">
                Drop review time from{" "}
                <span className="font-semibold text-[#b57900]">two</span> weeks
                {" "}to{" "}
                <span className="font-semibold text-[#b57900]">ten</span>{" "}
                minutes.
              </p>
            </div>
          </section>

          <footer className="space-y-8 pt-12">
            <section className="rounded-[2rem] border border-[#17120f]/12 bg-[linear-gradient(180deg,rgba(252,247,239,0.86),rgba(245,237,225,0.92))] px-6 py-8 shadow-[0_20px_60px_rgba(93,66,35,0.08)] sm:px-8">
              <p className="text-xs uppercase tracking-[0.34em] text-[#17120f]/58">
                Team From
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
                      className={`max-h-10 w-auto object-contain opacity-100 ${logo.className ?? ""} ${"imageClassName" in logo ? logo.imageClassName ?? "" : ""}`}
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
                Contact us
              </h2>
              <p className="mt-4 text-base leading-8 text-[#17120f]/72 sm:text-[1.05rem]">
                We are currently in private alpha and work with each firm
                one-on-one to deliver the best results. If you&rsquo;re
                interested in using GlowingStar in your firm, email{" "}
                <a
                  href={LAW_CONTACT_HREF}
                  className="font-medium text-[#17120f] underline decoration-[#17120f]/30 underline-offset-4"
                >
                  {LAW_CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </footer>
        </div>
      </main>
    </div>
  );
}
