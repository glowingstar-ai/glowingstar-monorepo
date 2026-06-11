"use client";

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { Menu, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { paperTextureDataUri } from "@/lib/paper-texture";
import { teamLogoList } from "@/lib/site-content";

const CONTACT_EMAIL = "support@glowingstar.ai";
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

const INK = "#17120f";
const GOLD = "#b57900";
const GOLD_DARK_BG = "#d09a2e";
const EASE_OUT_QUINT = [0.23, 1, 0.32, 1] as const;

const navLinks = [
  { href: "#about", label: "What we do" },
  { href: "#product", label: "Product" },
  { href: "#evidence", label: "Evidence" },
  { href: "#team", label: "Team" },
  { href: "#contact", label: "Contact" },
];

/* ----------------------------- motion primitives ---------------------------- */

const riseContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const riseItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT_QUINT },
  },
};

function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}): JSX.Element {
  const Tag = as === "section" ? m.section : m.div;
  return (
    <Tag
      className={className}
      variants={riseContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12%" }}
    >
      {children}
    </Tag>
  );
}

function RiseItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <m.div className={className} variants={riseItem}>
      {children}
    </m.div>
  );
}

/** Word-level cascade: each word rises out of an overflow-hidden slot. */
function WordCascade({
  text,
  highlight,
  delay = 0.2,
  className,
}: {
  text: string;
  highlight?: string;
  delay?: number;
  className?: string;
}): JSX.Element {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const highlightWords = highlight ? highlight.split(" ") : [];
  const highlightStart = highlight ? text.indexOf(highlight) : -1;
  const firstHighlightIndex =
    highlightStart >= 0 ? text.slice(0, highlightStart).trim().split(" ").filter(Boolean).length : -1;

  const sweepDelay = delay + words.length * 0.06 + 0.6;

  return (
    <span className={className}>
      {words.map((word, i) => {
        const inHighlight =
          firstHighlightIndex >= 0 &&
          i >= firstHighlightIndex &&
          i < firstHighlightIndex + highlightWords.length;
        const wordNode = (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <m.span
              className="inline-block"
              initial={reduced ? false : { y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: EASE_OUT_QUINT,
                delay: delay + i * 0.06,
              }}
            >
              {word}
            </m.span>
          </span>
        );
        if (!inHighlight) {
          return (
            <span key={`${word}-${i}`}>
              {wordNode}{" "}
            </span>
          );
        }
        const isFirstOfHighlight = i === firstHighlightIndex;
        if (!isFirstOfHighlight) return null;
        return (
          <span key={`hl-${i}`} className="whitespace-nowrap">
            <Sweep delay={sweepDelay}>
              {highlightWords.map((hw, j) => (
                <span key={`${hw}-${j}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <m.span
                    className="inline-block"
                    initial={reduced ? false : { y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: EASE_OUT_QUINT,
                      delay: delay + (firstHighlightIndex + j) * 0.06,
                    }}
                  >
                    {hw}
                    {j < highlightWords.length - 1 ? " " : ""}
                  </m.span>
                </span>
              ))}
            </Sweep>{" "}
          </span>
        );
      })}
    </span>
  );
}

/** True when the primary input can hover (gate mouseenter handlers so touch
 * taps don't double-fire against onClick). */
function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent): void => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return canHover;
}

/** Gold highlighter sweep — a marker stroke wiping across the text.
 * The band is a transform-animated overlay (compositor-friendly, unlike
 * background-position) sized in em so it hugs the glyphs instead of the
 * full line box. */
function Sweep({
  children,
  delay = 0.3,
  dark = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  dark?: boolean;
  className?: string;
}): JSX.Element {
  const reduced = useReducedMotion();
  const color = dark ? "rgba(208,154,46,0.30)" : "rgba(181,121,0,0.26)";
  return (
    <span className={`relative inline ${className ?? ""}`}>
      <m.span
        aria-hidden="true"
        className="absolute -inset-x-[0.06em] rounded-[3px]"
        style={{
          top: "0.14em",
          bottom: "0.02em",
          backgroundColor: color,
          transformOrigin: "0% 50%",
        }}
        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.5, ease: "linear", delay }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/** Animated count-up for stats. */
function CountUp({
  target,
  suffix = "",
  className,
}: {
  target: number;
  suffix?: string;
  className?: string;
}): JSX.Element {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, reduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ------------------------------- constellation ------------------------------ */

const SPARKLE_PATH =
  "M0,-6 C1,-1.5 1.5,-1 6,0 C1.5,1 1,1.5 0,6 C-1,1.5 -1.5,1 -6,0 C-1.5,-1 -1,-1.5 0,-6 Z";

const STARS = [
  { x: 300, y: 88, scale: 2.6, north: true },
  { x: 196, y: 56, scale: 1.1 },
  { x: 116, y: 124, scale: 0.9 },
  { x: 220, y: 168, scale: 1.3 },
  { x: 332, y: 208, scale: 1 },
  { x: 138, y: 252, scale: 1.2 },
  { x: 248, y: 296, scale: 0.9 },
  { x: 64, y: 196, scale: 0.8 },
  { x: 352, y: 320, scale: 1.1 },
  { x: 176, y: 348, scale: 1 },
];

const EDGES: Array<[number, number]> = [
  [1, 0],
  [2, 1],
  [3, 0],
  [3, 2],
  [4, 0],
  [5, 3],
  [6, 4],
  [7, 2],
  [8, 6],
  [9, 5],
];

// Fixed (not random) so server and client render identical markup.
const TWINKLE_DELAYS = [1.2, 3.4, 2.1, 5.6, 1.8, 4.3, 2.9, 6.2, 3.7, 5.1];

function Constellation({
  className,
  dim = false,
}: {
  className?: string;
  dim?: boolean;
}): JSX.Element {
  const reduced = useReducedMotion();
  const stroke = dim ? "rgba(241,233,218,0.22)" : "rgba(23,18,15,0.20)";
  const fill = dim ? "#f1e9da" : INK;
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {EDGES.map(([a, b], i) => (
        <m.line
          key={`edge-${i}`}
          x1={STARS[a].x}
          y1={STARS[a].y}
          x2={STARS[b].x}
          y2={STARS[b].y}
          stroke={stroke}
          strokeWidth="1"
          strokeDasharray="2 5"
          initial={reduced ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.8 + i * 0.12 }}
        />
      ))}
      {STARS.map((star, i) => (
        // Position and scale live on the static SVG attribute; animated
        // properties stay origin-independent (opacity, translate) so framer's
        // style.transform never clobbers the placement.
        <g
          key={`star-${i}`}
          transform={`translate(${star.x} ${star.y}) scale(${star.scale})`}
        >
          {star.north ? (
            <m.g
              initial={reduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
            >
              <circle r="14" fill={dim ? "rgba(208,154,46,0.18)" : "rgba(181,121,0,0.18)"} />
              <m.path
                d={SPARKLE_PATH}
                fill={dim ? GOLD_DARK_BG : GOLD}
                animate={reduced ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              />
            </m.g>
          ) : (
            <m.g
              initial={reduced ? false : { opacity: 0 }}
              whileInView={{ opacity: dim ? 0.5 : 0.65 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
            >
              <m.path
                d={SPARKLE_PATH}
                fill={fill}
                animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
                transition={{
                  duration: 2.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  delay: TWINKLE_DELAYS[i % TWINKLE_DELAYS.length],
                }}
              />
            </m.g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------- marginalia & rules ------------------------------- */

function Marginalia({
  children,
  dark = false,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <p
      className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
        dark ? "text-[#f1e9da]/40" : "text-[#17120f]/40"
      } ${className ?? ""}`}
    >
      {children}
    </p>
  );
}

function Eyebrow({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}): JSX.Element {
  return (
    <p
      className={`flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] ${
        dark ? "text-[#f1e9da]/60" : "text-[#17120f]/55"
      }`}
    >
      <span
        className="inline-block h-1.5 w-1.5"
        style={{ backgroundColor: dark ? GOLD_DARK_BG : GOLD }}
      />
      {children}
    </p>
  );
}

/** Footnote chip revealing a tilted post-it note on hover/focus/tap. */
function Footnote({
  index,
  note,
}: {
  index: number;
  note: string;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const canHover = useCanHover();
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={canHover ? () => setOpen(true) : undefined}
        onMouseLeave={canHover ? () => setOpen(false) : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="-translate-y-1 cursor-help border border-dotted border-[#17120f]/30 px-1 font-mono text-[10px] text-[#b57900] align-super"
      >
        {index}
      </button>
      <AnimatePresence>
        {open && (
          <span className="absolute bottom-full left-1/2 z-20 mb-2 block -translate-x-1/2">
            <m.span
              style={{ rotate: -1 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="block w-64 max-w-[75vw] border border-dotted border-[#17120f]/25 bg-[#fbf6ea] p-4 font-mono text-[10.5px] normal-case leading-relaxed tracking-normal text-[#17120f]/75 shadow-[0_14px_30px_rgba(93,66,35,0.18)]"
            >
              {note}
            </m.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Horizontal micro-bar that grows in on scroll. */
function MicroBar({
  widthPercent,
  gold = false,
  dark = false,
  delay = 0,
}: {
  widthPercent: number;
  gold?: boolean;
  dark?: boolean;
  delay?: number;
}): JSX.Element {
  const color = gold
    ? dark
      ? GOLD_DARK_BG
      : GOLD
    : dark
      ? "rgba(241,233,218,0.55)"
      : "rgba(23,18,15,0.55)";
  return (
    <div
      className={`h-2 w-full overflow-hidden ${dark ? "bg-[#f1e9da]/10" : "bg-[#17120f]/8"}`}
    >
      <m.div
        className="h-full origin-left"
        style={{ width: `${widthPercent}%`, backgroundColor: color }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7, ease: EASE_OUT_QUINT, delay }}
      />
    </div>
  );
}

/* --------------------------------- header --------------------------------- */

function Header({ dark }: { dark: boolean }): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        dark
          ? "border-[#f1e9da]/15 bg-[rgba(20,15,10,0.85)] text-[#f1e9da]"
          : "border-[#17120f]/10 bg-[rgba(245,239,227,0.88)] text-[#17120f]"
      } backdrop-blur`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GlowingStar"
            width={30}
            height={30}
            priority
            className="h-[30px] w-[30px] object-contain drop-shadow-[0_4px_12px_rgba(235,179,43,0.18)]"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em]">
            GlowingStar
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`gs-underline font-mono text-[11px] uppercase tracking-[0.14em] ${
                dark ? "text-[#f1e9da]/70 hover:text-[#f1e9da]" : "text-[#17120f]/65 hover:text-[#17120f]"
              } transition-colors`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={CONTACT_HREF}
            className={`gs-glow hidden rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-300 sm:inline-block ${
              dark
                ? "border-[#f1e9da]/25 text-[#f1e9da] hover:bg-[#f1e9da]/10"
                : "border-[#17120f]/20 bg-[rgba(255,252,247,0.85)] text-[#17120f] hover:bg-[#fffaf1]"
            }`}
          >
            Get in touch
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <m.div
        className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left"
        style={{ scaleX: progress, backgroundColor: dark ? GOLD_DARK_BG : GOLD }}
      />
      <AnimatePresence>
        {menuOpen && (
          <m.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
            className="fixed inset-x-0 top-[63px] z-40 h-[calc(100svh-63px)] bg-[#f5efe3] px-8 pt-10 md:hidden"
          >
            <ul className="space-y-2 border-t border-dotted border-[#17120f]/20 pt-8">
              {navLinks.map((link, i) => (
                <m.li
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.5, ease: EASE_OUT_QUINT }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-editorial-display block py-2 text-4xl text-[#17120f]"
                  >
                    <span className="mr-4 font-mono text-xs text-[#b57900]">
                      0{i + 1}
                    </span>
                    {link.label}
                  </a>
                </m.li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------------------------- hero ---------------------------------- */

function Hero(): JSX.Element {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 50,
    damping: 20,
  });
  const sy = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), {
    stiffness: 50,
    damping: 20,
  });
  const spotX = useSpring(useMotionValue(0), { stiffness: 60, damping: 22 });
  const spotY = useSpring(useMotionValue(0), { stiffness: 60, damping: 22 });

  const handleMouse = (e: React.MouseEvent<HTMLElement>): void => {
    if (reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
    // Center the 600px spotlight on the cursor; framer owns this element's
    // transform, so the offset can't come from translate utility classes.
    spotX.set(e.clientX - rect.left - 300);
    spotY.set(e.clientY - rect.top - 300);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouse}
      className="relative flex min-h-[92svh] items-center overflow-hidden"
    >
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 hidden h-[600px] w-[600px] rounded-full lg:block"
        style={{
          x: spotX,
          y: spotY,
          background:
            "radial-gradient(circle, rgba(181,121,0,0.10), transparent 65%)",
          mixBlendMode: "soft-light",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute right-[-4%] top-1/2 z-0 w-[58%] max-w-[560px] -translate-y-1/2 opacity-30 sm:opacity-60 lg:opacity-100"
      >
        <m.div style={{ x: sx, y: sy }}>
          <Constellation className="h-auto w-full" />
        </m.div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-28 sm:px-10">
        <Eyebrow>AI-native learning, measured</Eyebrow>
        <h1 className="font-editorial-display mt-7 max-w-[14ch] text-[clamp(2.9rem,7.5vw,6.25rem)] leading-[0.97] tracking-[-0.02em] text-[#17120f]">
          <WordCascade
            text="AI learning programs with the evidence built in."
            highlight="evidence built in."
          />
        </h1>
        <m.p
          className="mt-8 max-w-xl text-lg leading-8 text-[#17120f]/72 sm:text-xl"
          initial={reduced ? false : { opacity: 0, filter: "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 1, ease: EASE_OUT_QUINT }}
        >
          We run AI tutoring for schools and instrument every session, so
          institutions see measured outcomes — not vendor claims.
        </m.p>
        <m.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2, ease: EASE_OUT_QUINT }}
        >
          <a
            href={CONTACT_HREF}
            className="gs-glow rounded-full bg-[#17120f] px-7 py-3.5 text-sm font-medium text-[#f5efe3] transition-all duration-300"
          >
            Partner with us
          </a>
          <Link
            href="/manifesto"
            className="gs-underline py-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#17120f]/75 transition-colors hover:text-[#17120f]"
          >
            Read our manifesto
          </Link>
        </m.div>
        <m.div
          className="mt-12 flex flex-wrap gap-2.5"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.5 }}
        >
          {["Assessments", "Conversations", "Confidence"].map((chip) => (
            <span
              key={chip}
              className="border border-dotted border-[#17120f]/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/55"
            >
              {chip}
            </span>
          ))}
        </m.div>
      </div>

      <Marginalia className="absolute bottom-6 left-6 sm:left-10">
        Fig. 01 — The GlowingStar constellation
      </Marginalia>
      <div className="absolute bottom-6 right-6 hidden flex-col items-center gap-2 sm:flex sm:right-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#17120f]/40">
          Scroll
        </span>
        <m.span
          className="block h-6 w-px origin-top bg-[#17120f]/35"
          animate={reduced ? undefined : { scaleY: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}

/* ------------------------------ problem band ------------------------------ */

const WHAT_WE_DO_ROWS = [
  { label: "Tutoring engine", clause: "multi-agent plans, explanations, practice" },
  { label: "Classroom deployment", clause: "teacher-controlled, runs as coursework" },
  { label: "Pre/post assessment", clause: "with per-question confidence ratings" },
  { label: "Full telemetry", clause: "every message and attempt, logged" },
];

function ProblemBand(): JSX.Element {
  return (
    <section id="about" className="relative scroll-mt-2">
      <div className="h-24 bg-gradient-to-b from-transparent to-[#e6dcc8]/70" />
      <div className="bg-[#e6dcc8]/70">
        <div className="mx-auto w-full max-w-6xl border-y border-dotted border-[#17120f]/20 px-6 py-20 sm:px-10 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-[22vh] lg:self-start">
              <Eyebrow>The problem</Eyebrow>
              <h2 className="font-editorial-display mt-6 text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] text-[#17120f]">
                AI tutoring is everywhere.{" "}
                <Sweep delay={0.5}>The evidence is not.</Sweep>
              </h2>
              <p className="font-editorial-display mt-8 text-xl italic text-[#17120f]/65">
                Learning that is measured, not assumed.
              </p>
              <Marginalia className="mt-10">
                Fig. 02 — The calibration gap
              </Marginalia>
            </div>

            <div>
              <Reveal className="space-y-7">
                <RiseItem>
                  <p className="text-base leading-8 text-[#17120f]/75 sm:text-lg">
                    Generic AI study tools are everywhere. Whether students
                    actually learn — or just feel like they did — goes
                    unmeasured. In our own classroom study, AI-tutored practice
                    matched quiz-only practice on scores, while students grew
                    more confident on the answers they got wrong.
                    <Footnote
                      index={1}
                      note="Within-student comparison at one Hong Kong secondary school: 323 students, four subjects, ~1,150 sessions. Reported with limitations — not a causal claim."
                    />
                  </p>
                </RiseItem>

                <RiseItem className="space-y-5 border border-dotted border-[#17120f]/25 bg-[#f3ecdc]/60 p-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/55">
                      Test-score gain
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#17120f]/45">
                          Quiz-only
                        </span>
                        <MicroBar widthPercent={64} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#17120f]/45">
                          + AI tutor
                        </span>
                        <MicroBar widthPercent={66} delay={0.12} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/55">
                      Confidence when wrong
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#17120f]/45">
                          Quiz-only
                        </span>
                        <MicroBar widthPercent={48} delay={0.24} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#17120f]/45">
                          + AI tutor
                        </span>
                        <MicroBar widthPercent={72} gold delay={0.36} />
                      </div>
                    </div>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#17120f]/40">
                    Illustrative proportions — full figures in the evidence
                    section
                  </p>
                </RiseItem>

                <RiseItem>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/55">
                    What we do about it
                  </p>
                  <ul className="mt-3">
                    {WHAT_WE_DO_ROWS.map((row) => (
                      <li
                        key={row.label}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-dotted border-[#17120f]/20 py-3.5 first:border-t"
                      >
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#17120f]">
                          {row.label}
                        </span>
                        <span className="font-editorial-display text-base italic text-[#17120f]/60">
                          {row.clause}
                        </span>
                      </li>
                    ))}
                  </ul>
                </RiseItem>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
      <div className="h-24 bg-gradient-to-b from-[#e6dcc8]/70 to-transparent" />
    </section>
  );
}

/* ------------------------------ product index ------------------------------ */

const PRODUCT_PILLARS = [
  {
    name: "Tutor Studio",
    description:
      "A manager agent and four specialists turn any topic into a structured, adaptive tutoring plan.",
    chips: ["Multi-agent plans", "Visual explanations", "Instant quizzes"],
  },
  {
    name: "Classroom Deployment",
    description:
      "Teacher-controlled session links; students move through pre-test, tutoring, and post-test as real coursework.",
    chips: ["Teacher controls", "Pre/post tests", "Multilingual"],
  },
  {
    name: "Evidence Layer",
    description:
      "Every message, attempt, and confidence rating captured — dashboards show what worked, per cohort and student.",
    chips: ["Full telemetry", "Confidence tracking", "Dashboards"],
  },
  {
    name: "Beyond Multiple Choice",
    description:
      "Realtime voice and oral-defense workflows measure reasoning, not just option-picking.",
    chips: ["Realtime voice", "Oral defense", "Richer signals"],
  },
];

function ProductIndex(): JSX.Element {
  const [active, setActive] = useState<number | null>(null);
  const canHover = useCanHover();

  return (
    <section id="product" className="relative mx-auto w-full max-w-6xl scroll-mt-2 px-6 py-20 sm:px-10">
      <Eyebrow>Product</Eyebrow>
      <h2 className="font-editorial-display mt-6 max-w-2xl text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] text-[#17120f]">
        One platform, indexed.
      </h2>

      <Reveal className="mt-12">
        {PRODUCT_PILLARS.map((pillar, i) => {
          const isActive = active === i;
          return (
            <RiseItem key={pillar.name}>
              <div
                className="group border-b border-dashed border-[#17120f]/20 first:border-t"
                onMouseEnter={canHover ? () => setActive(i) : undefined}
                onMouseLeave={
                  canHover
                    ? () => setActive((v) => (v === i ? null : v))
                    : undefined
                }
              >
                <button
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => setActive((v) => (v === i ? null : i))}
                  className="flex w-full items-baseline gap-5 py-6 text-left sm:gap-8"
                >
                  <span className="font-mono text-xs text-[#b57900] sm:text-sm">
                    0{i + 1}
                  </span>
                  <span className="font-editorial-display relative inline-block text-[clamp(1.7rem,4.2vw,3.4rem)] leading-[0.95] text-[#17120f]">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-[6%] left-[-2%] right-[-2%] -skew-x-12 bg-[#b57900]/15 transition-transform duration-300 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                      style={{ transformOrigin: "0% 50%" }}
                    />
                    <span
                      className={`relative transition-opacity duration-200 ${isActive ? "opacity-0" : "opacity-100"}`}
                    >
                      {pillar.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 italic transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}
                    >
                      {pillar.name}
                    </span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isActive && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-7 pl-10 pr-2 sm:pl-16">
                        <p className="max-w-md text-base leading-7 text-[#17120f]/70">
                          {pillar.description}
                        </p>
                        <span className="flex flex-wrap gap-2">
                          {pillar.chips.map((chip) => (
                            <span
                              key={chip}
                              className="border border-dotted border-[#17120f]/25 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#17120f]/55"
                            >
                              {chip}
                            </span>
                          ))}
                        </span>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </RiseItem>
          );
        })}
      </Reveal>

      <SessionReplay />

      <p className="mt-8 text-center">
        <Link
          href="/tutor-mode"
          className="gs-underline font-mono text-[12px] uppercase tracking-[0.14em] text-[#17120f]/75 transition-colors hover:text-[#17120f]"
        >
          Try Tutor Mode Studio →
        </Link>
      </p>
    </section>
  );
}

/* ------------------------------ session replay ------------------------------ */

type ReplayEvent = { at: number; time: string; label: string };

const REPLAY_EVENTS: ReplayEvent[] = [
  { at: 0, time: "00:00.0", label: "session_started" },
  { at: 0, time: "00:00.4", label: "message_sent" },
  { at: 2, time: "00:02.4", label: "tutor_response · 42 tokens" },
  { at: 3, time: "00:06.1", label: "quiz_served" },
  { at: 4, time: "00:08.0", label: "answer_selected" },
  { at: 5, time: "00:08.6", label: "confidence_rating · very (3/3)" },
  { at: 6, time: "00:09.6", label: "quiz_attempt · incorrect" },
  { at: 7, time: "00:10.2", label: "calibration_flag" },
];

const STEP_DURATIONS = [1600, 900, 3400, 1700, 700, 1000, 700, 1500, 4200];
const FINAL_STEP = 8;

const TUTOR_REPLY =
  "Water is unusual: as it freezes, hydrogen bonds lock molecules into an open lattice, so ice is less dense than liquid water — and floats.";

const QUIZ_OPTIONS = [
  { text: "Ice is colder, and cold things rise", wrong: true },
  { text: "Its crystal lattice is less dense than liquid water", correct: true },
  { text: "Air bubbles trapped in ice lift it", picked: true },
  { text: "Surface tension holds it up" },
];

function SessionReplay(): JSX.Element {
  const reduced = useReducedMotion();
  const canHover = useCanHover();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15%" });
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(reduced ? FINAL_STEP : 0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced || !inView || paused) return;
    const duration = STEP_DURATIONS[Math.min(step, STEP_DURATIONS.length - 1)];
    const timer = setTimeout(() => {
      if (step >= STEP_DURATIONS.length - 1) {
        setStep(0);
        setCycle((c) => c + 1);
      } else {
        setStep((s) => s + 1);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [step, inView, paused, reduced]);

  const restart = (): void => {
    setStep(0);
    setCycle((c) => c + 1);
  };

  const events = REPLAY_EVENTS.filter((e) => e.at <= step);

  return (
    <div
      ref={ref}
      onMouseEnter={canHover ? () => setPaused(true) : undefined}
      onMouseLeave={canHover ? () => setPaused(false) : undefined}
      className="relative mt-16 rounded-[2.5rem] rounded-bl-none border border-dotted border-[#17120f]/25 bg-[#f3ecdc]/70 p-6 sm:p-9"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Marginalia>
          Fig. 02a — Session replay (reconstructed from real telemetry)
        </Marginalia>
        <button
          type="button"
          onClick={restart}
          aria-label="Replay session"
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#17120f]/50 transition-colors hover:text-[#17120f]"
        >
          <RotateCcw className="h-3 w-3" /> Replay
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]" key={cycle}>
        {/* Chat pane */}
        <div className="min-h-[330px] space-y-6" aria-live="off">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/45">
              Student
            </p>
            <p className="font-editorial-display mt-1.5 text-xl text-[#17120f]">
              {"Why does ice float on water?".split("").map((ch, i) => (
                <m.span
                  key={i}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.035, duration: 0.05 }}
                >
                  {ch}
                </m.span>
              ))}
            </p>
          </div>

          {step === 1 && !reduced && (
            <div className="flex gap-1.5 pl-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <m.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#17120f]/40"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          )}

          {step >= 2 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#b57900]">
                GlowingStar Tutor
              </p>
              <p className="mt-1.5 max-w-lg text-[15px] leading-7 text-[#17120f]/80">
                {TUTOR_REPLY.split(" ").map((word, i) => (
                  <m.span
                    key={i}
                    className="inline"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.055, duration: 0.2 }}
                  >
                    {word}{" "}
                  </m.span>
                ))}
              </p>
            </div>
          )}

          <AnimatePresence>
            {step >= 3 && (
              <m.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT_QUINT }}
                className="border border-dotted border-[#17120f]/30 bg-[#fbf6ea] p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/50">
                  Quick check · Which property explains it?
                </p>
                <ul className="mt-3 space-y-2">
                  {QUIZ_OPTIONS.map((opt, i) => {
                    const isPicked = Boolean(opt.picked) && step >= 4;
                    const isCorrect = Boolean(opt.correct) && step >= 6;
                    const struck = isPicked && step >= 6;
                    return (
                      <li
                        key={i}
                        className={`flex items-baseline gap-3 text-sm leading-6 transition-colors duration-300 ${
                          isPicked && !struck
                            ? "text-[#17120f]"
                            : "text-[#17120f]/65"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-[#17120f]/40">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span
                          className={`${
                            struck ? "text-[#17120f]/40 line-through decoration-[#b57900] decoration-2" : ""
                          } ${isCorrect ? "underline decoration-[#b57900] decoration-2 underline-offset-4" : ""} ${
                            isPicked && !struck ? "bg-[#b57900]/15 px-1" : ""
                          }`}
                        >
                          {opt.text}
                        </span>
                        {isPicked && (
                          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-[#b57900]">
                            picked
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {step >= 5 && (
                  <div className="mt-4 border-t border-dotted border-[#17120f]/20 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#17120f]/50">
                        Student confidence
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#17120f]">
                        Very confident
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-[#17120f]/10">
                      <m.div
                        className="h-full origin-left bg-[#b57900]"
                        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
                        style={{ width: "85%" }}
                      />
                    </div>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {step >= 8 && (
            <m.p
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#17120f]/45"
            >
              Every event above is logged — 253,000+ and counting.
            </m.p>
          )}
        </div>

        {/* Telemetry pane */}
        <div className="border-t border-dotted border-[#17120f]/25 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/50">
            Event log
          </p>
          <ul className="mt-3">
            {events.map((event, i) => (
              <m.li
                key={`${event.label}-${i}`}
                initial={reduced ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-baseline gap-3 border-b border-dotted border-[#17120f]/15 py-2 font-mono text-[10.5px] text-[#17120f]/65"
              >
                <span className="text-[#17120f]/35">{event.time}</span>
                <span>{event.label}</span>
              </m.li>
            ))}
          </ul>
          <AnimatePresence>
            {step >= 7 && (
              <m.div
                style={{ rotate: -1 }}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT_QUINT }}
                className="mt-5 border border-[#b57900]/50 bg-[#b57900]/10 px-4 py-3"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8a5d00]">
                  <Sweep delay={0.2}>Confidently wrong — flagged</Sweep>
                </p>
                <p className="mt-1 font-mono text-[9.5px] text-[#17120f]/55">
                  High confidence + incorrect answer. A score alone would miss
                  this.
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Static transcript for screen readers */}
      <p className="sr-only">
        Demo transcript: a student asks why ice floats on water. The tutor
        explains hydrogen bonding and density, then serves a quiz. The student
        picks a wrong answer with high confidence. The system logs every event
        and flags the confidently-wrong response — the calibration signal a
        test score alone would miss.
      </p>
    </div>
  );
}

/* -------------------------------- evidence -------------------------------- */

const EVIDENCE_STATS = [
  { value: 323, suffix: "", label: "students in our first school deployment" },
  { value: 4, suffix: "", label: "subjects, taught in Traditional Chinese" },
  { value: 2751, suffix: "", label: "student–tutor conversations" },
  { value: 253, suffix: "k", label: "interaction events logged" },
];

const FINDING_ROWS = [
  {
    label: "Test scores",
    clause: "both groups improved similarly",
    width: 62,
    gold: false,
  },
  {
    label: "Confidence when wrong",
    clause: "higher in AI-tutored subjects",
    width: 78,
    gold: true,
  },
  {
    label: "The gap",
    clause: "exactly what our instrumentation catches",
    width: 92,
    gold: true,
  },
];

function Evidence({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement>;
}): JSX.Element {
  return (
    <section
      id="evidence"
      ref={sectionRef}
      className="relative scroll-mt-2 bg-[#1a140e] text-[#f1e9da]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#ede6d9] to-transparent opacity-20"
      />
      <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-28">
        <Eyebrow dark>Evidence</Eyebrow>
        <h2 className="font-editorial-display mt-6 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02]">
          We report the <Sweep dark delay={0.5}>inconvenient</Sweep> results
          too.
        </h2>

        <Reveal className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {EVIDENCE_STATS.map((stat) => (
            <RiseItem
              key={stat.label}
              className="border-y border-dotted border-[#f1e9da]/20 py-6"
            >
              <p className="font-editorial-display text-[clamp(2.6rem,5vw,4.2rem)] leading-none text-[#d09a2e]">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[#f1e9da]/55">
                {stat.label}
              </p>
            </RiseItem>
          ))}
        </Reveal>

        <Reveal className="mt-14 max-w-3xl">
          {FINDING_ROWS.map((row, i) => (
            <RiseItem
              key={row.label}
              className="grid gap-3 border-b border-dotted border-[#f1e9da]/15 py-5 first:border-t sm:grid-cols-[200px_1fr_180px] sm:items-center"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f1e9da]/60">
                {row.label}
              </span>
              <span className="font-editorial-display text-lg italic text-[#f1e9da]/85">
                {row.clause}
              </span>
              <MicroBar widthPercent={row.width} gold={row.gold} dark delay={i * 0.12} />
            </RiseItem>
          ))}
          <RiseItem className="pt-6">
            <p className="text-sm leading-7 text-[#f1e9da]/60">
              From a within-student comparison of quiz-only vs. quiz-plus-AI
              tutoring, run as real coursework.
              <Footnote
                index={2}
                note="~1,150 sessions across physics, chemistry, geography, and history at one Hong Kong secondary school; pre/post tests with per-question confidence ratings. Findings reported with stated limitations."
              />{" "}
              That honesty is the product: institutions should demand evidence
              from any AI learning tool they adopt — including ours.
            </p>
          </RiseItem>
        </Reveal>

        <Marginalia dark className="mt-14">
          Fig. 03 — Field study, Hong Kong, N=323
        </Marginalia>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#ede6d9] to-transparent opacity-20"
      />
    </section>
  );
}

/* ---------------------------------- team ---------------------------------- */

function Team(): JSX.Element {
  const reduced = useReducedMotion();
  const logos = [...teamLogoList, ...teamLogoList];

  return (
    <section id="team" className="mx-auto w-full max-w-6xl scroll-mt-2 px-6 py-20 sm:px-10 sm:py-24">
      <Eyebrow>Builders × Researchers</Eyebrow>
      <Reveal>
        <RiseItem>
          <h2 className="font-editorial-display mt-6 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] text-[#17120f]">
            The people who ship the tutoring engine also design the studies —
            and publish the caveats.
          </h2>
        </RiseItem>
        <RiseItem>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#17120f]/70 sm:text-lg">
            Our team&rsquo;s backgrounds span Harvard, MIT, Stanford, and the
            University of Toronto, including work through the MIT Media Lab and
            the Harvard Innovation Labs.
          </p>
        </RiseItem>
      </Reveal>

      <div
        className="mt-12 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 18%, black 82%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 18%, black 82%, transparent)",
        }}
      >
        {reduced ? (
          <div className="flex flex-wrap items-center justify-center gap-10">
            {teamLogoList.map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={48}
                className={`max-h-9 w-auto object-contain mix-blend-multiply ${logo.className ?? ""} ${"imageClassName" in logo ? logo.imageClassName ?? "" : ""}`}
              />
            ))}
          </div>
        ) : (
          <m.div
            className="flex w-max items-center gap-16 pr-16"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 32, ease: "linear", repeat: Infinity }}
          >
            {logos.map((logo, i) => (
              <Image
                key={`${logo.alt}-${i}`}
                src={logo.src}
                alt={i < teamLogoList.length ? logo.alt : ""}
                aria-hidden={i >= teamLogoList.length}
                width={120}
                height={48}
                className={`max-h-9 w-auto shrink-0 object-contain mix-blend-multiply ${logo.className ?? ""} ${"imageClassName" in logo ? logo.imageClassName ?? "" : ""}`}
              />
            ))}
          </m.div>
        )}
      </div>

      <Reveal className="mt-16">
        <RiseItem className="border-y border-dotted border-[#17120f]/20 py-10 text-center">
          <p className="font-editorial-display mx-auto max-w-2xl text-2xl italic leading-snug text-[#17120f] sm:text-3xl">
            &ldquo;Every student is a{" "}
            <Sweep delay={0.5}>glowing star</Sweep>. Our job is to help them
            shine.&rdquo;
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#17120f]/45">
            Our founding conviction
          </p>
        </RiseItem>
      </Reveal>

      <Marginalia className="mt-10">Fig. 04 — The workshop</Marginalia>
    </section>
  );
}

/* --------------------------------- contact --------------------------------- */

function Contact(): JSX.Element {
  return (
    <section
      id="contact"
      className="relative mx-auto flex min-h-[88svh] w-full max-w-6xl scroll-mt-2 items-center overflow-hidden px-6 py-20 sm:px-10"
    >
      <div
        aria-hidden="true"
        className="absolute right-[-6%] top-1/2 w-[52%] max-w-[480px] -translate-y-1/2 opacity-25"
      >
        <Constellation className="h-auto w-full" />
      </div>
      <div className="relative z-10 w-full">
        <Eyebrow>Contact</Eyebrow>
        <h2 className="font-editorial-display mt-7 max-w-[14ch] text-[clamp(2.5rem,6.5vw,5rem)] leading-[0.98] text-[#17120f]">
          <WordCascade
            text="Bring measured learning to your institution."
            highlight="measured"
            delay={0.1}
          />
        </h2>
        <Reveal>
          <RiseItem>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#17120f]/70 sm:text-lg">
              Onboarding a small number of partner schools and universities for
              upcoming terms.
            </p>
          </RiseItem>
          <RiseItem>
            <a
              href={CONTACT_HREF}
              className="gs-glow mt-9 inline-block rounded-full bg-[#17120f] px-8 py-4 font-mono text-[13px] tracking-[0.06em] text-[#f5efe3] transition-all duration-300 hover:bg-[#b57900] hover:text-[#17120f]"
            >
              {CONTACT_EMAIL}
            </a>
          </RiseItem>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- footer --------------------------------- */

function Footer(): JSX.Element {
  return (
    <footer className="relative border-t border-dotted border-[#17120f]/25">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/50">
          © 2026 GlowingStar, Inc.
        </p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { href: "/manifesto", label: "Manifesto" },
            { href: "/law", label: "For law firms" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href as "/manifesto"}
              className="gs-underline font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/55 transition-colors hover:text-[#17120f]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={CONTACT_HREF}
            className="gs-underline font-mono text-[10px] uppercase tracking-[0.16em] text-[#17120f]/55 transition-colors hover:text-[#17120f]"
          >
            {CONTACT_EMAIL}
          </a>
        </nav>
        <p
          aria-hidden="true"
          className="-rotate-1 font-mono text-[11px] tracking-[0.3em] text-[#b57900]"
        >
          * · ✦ · *
        </p>
      </div>
    </footer>
  );
}

/* ----------------------------------- page ---------------------------------- */

export default function HomeLandingPage(): JSX.Element {
  const evidenceRef = useRef<HTMLElement>(null);
  const [navDark, setNavDark] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", () => {
    const rect = evidenceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const crossing = rect.top < 72 && rect.bottom > 72;
    setNavDark((prev) => (prev === crossing ? prev : crossing));
  });

  const styles = useMemo(
    () => `
      .gs-underline { position: relative; }
      .gs-underline::after {
        content: "";
        position: absolute;
        left: 0; right: 0; bottom: -3px;
        height: 1px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: bottom right;
        transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
      .gs-underline:hover::after,
      .gs-underline:focus-visible::after {
        transform: scaleX(1);
        transform-origin: bottom left;
      }
      .gs-glow:hover, .gs-glow:focus-visible {
        box-shadow: 0 0 25px rgba(181, 121, 0, 0.35);
      }
    `,
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="relative min-h-screen overflow-x-clip bg-[#ede6d9] text-[#17120f] selection:bg-[#17120f] selection:text-[#f5efe3]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_54%),linear-gradient(180deg,#f5efe3_0%,#ece2d2_48%,#e7ddce_100%)]"
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

        <Header dark={navDark} />

        <main className="relative">
          <Hero />
          <ProblemBand />
          <ProductIndex />
          <Evidence sectionRef={evidenceRef} />
          <Team />
          <Contact />
        </main>

        <Footer />
      </div>
    </LazyMotion>
  );
}
