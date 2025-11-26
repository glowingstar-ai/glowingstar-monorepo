"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LogoCarousel from "@/components/ui/LogoCarousel";
import {
  Activity,
  Sparkles,
  Radar,
  ArrowUpRight,
  NotebookPen,
  Feather,
  Star,
  GraduationCap,
  Palette,
  LucideIcon,
  Camera,
  Upload,
  Brain,
  Heart,
  BookOpen,
  CheckCircle2,
  Building2,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
};

type Highlight = {
  title: string;
  description: string;
};

type GlowTile = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const navigation: NavigationItem[] = [
  { label: "Features", href: "#features" },
  { label: "Why GlowingStar", href: "#why-glowing" },
];

const studentFeatures = [
  {
    name: "Personal AI Tutor",
    description:
      "Your tutor that actually gets you. It notices when you&apos;re frustrated and slows down, celebrates when you&apos;re excited, and adapts explanations to how you learn best—all in real-time.",
    href: "/tutor-mode",
    icon: Brain,
    accent: "from-amber-300 via-amber-200 to-amber-400",
    pill: "AI Tutor",
  },
  {
    name: "Learning Insights",
    description:
      "Understand your learning journey like never before. See how your emotions, focus, and engagement affect your progress, and discover patterns that help you study smarter.",
    href: "/emotion-console",
    icon: Activity,
    accent: "from-emerald-300/80 to-teal-400/80",
    pill: "Insights",
  },
  {
    name: "Instant Homework Help",
    description:
      "Stuck on a problem? Get step-by-step guidance instantly. Our AI understands context, shows you where you went wrong, and helps you learn from mistakes—not just get the answer.",
    href: "/realtime-assistant",
    icon: Star,
    accent: "from-sky-300 via-indigo-200 to-indigo-400",
    pill: "24/7 Help",
  },
];

const teacherFeatures = [
  {
    name: "Photo-to-Grade in Seconds",
    description:
      "Snap a photo, get a grade. No more late nights with red pens. Our AI reads handwriting, checks answers, and provides detailed feedback—all in under 30 seconds per assignment.",
    href: "/emotion-console",
    icon: Camera,
    accent: "from-violet-300/80 to-fuchsia-400/80",
    pill: "Instant Grading",
  },
  {
    name: "Actionable Student Insights",
    description:
      "See exactly where each student struggles and shines. Get personalized feedback suggestions, identify learning gaps, and track progress across your entire class at a glance.",
    href: "/notes",
    icon: CheckCircle2,
    accent: "from-rose-400/80 to-amber-400/70",
    pill: "Smart Analytics",
  },
  {
    name: "Grade Entire Classes at Once",
    description:
      "Upload a stack of papers or process an entire exam. Our system handles multiple assignments simultaneously, giving you complete results in minutes instead of hours.",
    href: "/realtime-assistant",
    icon: Upload,
    accent: "from-cyan-400/80 to-blue-500/80",
    pill: "Batch Processing",
  },
];

const schoolFeatures = [
  {
    name: "District-Wide Analytics",
    description:
      "Get comprehensive insights across all schools, classes, and students. Track learning outcomes, identify trends, and make data-driven decisions that improve education at scale.",
    href: "/emotion-console",
    icon: BarChart3,
    accent: "from-blue-300/80 to-indigo-400/80",
    pill: "Analytics",
  },
  {
    name: "Unified Infrastructure",
    description:
      "Deploy AI-native education tools across your entire district. One platform that scales from individual classrooms to thousands of students, with enterprise-grade security and compliance.",
    href: "/notes",
    icon: Building2,
    accent: "from-purple-300/80 to-pink-400/80",
    pill: "Infrastructure",
  },
  {
    name: "Personalized Learning at Scale",
    description:
      "Enable personalized education for every student in your district. Our AI adapts to each learner while providing administrators with the insights needed to support teachers and improve outcomes.",
    href: "/realtime-assistant",
    icon: Users,
    accent: "from-emerald-300/80 to-teal-400/80",
    pill: "Scale",
  },
];

const studentHighlights: Highlight[] = [
  {
    title: "Understands how you feel",
    description:
      "Frustrated? It slows down and breaks concepts into smaller steps. Excited? It challenges you with advanced problems. Your tutor adapts in real-time.",
  },
  {
    title: "Learns your style",
    description:
      "Visual learner? It shows diagrams. Prefer examples? It provides them. The more you interact, the better it understands how you learn best.",
  },
  {
    title: "Always there when you need it",
    description:
      "Midnight study session? Weekend homework? Your tutor never sleeps. Get help the moment you need it, wherever you are.",
  },
];

const teacherHighlights: Highlight[] = [
  {
    title: "Grade in seconds, not hours",
    description:
      "What used to take 30 minutes now takes 30 seconds. Snap a photo, get instant grades and feedback—spend your time teaching, not grading.",
  },
  {
    title: "See your class at a glance",
    description:
      "Identify struggling students instantly, spot common mistakes across assignments, and track progress trends—all in one dashboard.",
  },
  {
    title: "Reclaim your evenings",
    description:
      "Stop taking work home. Grade an entire class in minutes, get detailed insights automatically, and focus on what you love—teaching.",
  },
];

const schoolHighlights: Highlight[] = [
  {
    title: "AI infrastructure built for education",
    description:
      "Deploy personalized learning across your entire district. Our platform scales from single classrooms to thousands of students with enterprise security and compliance.",
  },
  {
    title: "Data-driven decision making",
    description:
      "Get district-wide insights that help you identify what's working, where students need support, and how to allocate resources for maximum impact.",
  },
  {
    title: "Empower every teacher and student",
    description:
      "Give teachers powerful tools to personalize instruction while ensuring every student gets the support they need to succeed—all on one unified platform.",
  },
];

const glowTiles: GlowTile[] = [
  {
    title: "Emotionally intelligent",
    description:
      "Learning isn&apos;t just cognitive—it&apos;s emotional. Our AI recognizes when students are struggling, excited, or ready for a challenge, and responds accordingly.",
    icon: Heart,
  },
  {
    title: "Lightning fast",
    description:
      "Students get help instantly. Teachers get grades in seconds. No waiting, no delays—just results exactly when you need them.",
    icon: Sparkles,
  },
  {
    title: "Built for you",
    description:
      "Every student learns uniquely. Every teacher has different workflows. Our platform adapts to how you work, not the other way around.",
    icon: BookOpen,
  },
];

const studentStats = [
  {
    label: "Students helped",
    value: "50K+",
  },
  {
    label: "24/7 availability",
    value: "Always on",
  },
  {
    label: "Response time",
    value: "<1s",
  },
];

const teacherStats = [
  {
    label: "Assignments graded",
    value: "100K+",
  },
  {
    label: "Time saved",
    value: "10hrs/week",
  },
  {
    label: "Grading speed",
    value: "<30s",
  },
];

const schoolStats = [
  {
    label: "Schools supported",
    value: "500+",
  },
  {
    label: "Students reached",
    value: "250K+",
  },
  {
    label: "Uptime",
    value: "99.9%",
  },
];

const LOGOS = {
  light: {
    harvard: "/logos/harvard-logo-light.svg",
    adobe: "/logos/adobe-logo-light.svg",
    block: "/logos/block-logo-light.png",
    citadel: "/logos/citadel-logo-light.svg",
    rippling: "/logos/rippling-logo-light.svg",
  },
  dark: {
    harvard: "/logos/harvard-logo-dark.svg",
    adobe: "/logos/adobe-logo-dark.svg",
    block: "/logos/block-logo-dark.png",
    citadel: "/logos/citadel-logo-dark.svg",
    rippling: "/logos/rippling-logo-dark.svg",
  },
  common: {
    mit: "/logos/mit.svg",
    cmu: "/logos/cmu.png",
    chicago: "/logos/chicago.svg",
    waterloo: "/logos/waterloo.svg",
    toronto: "/logos/toronto.svg",
  },
};

const logoList = [
  { src: LOGOS.dark.harvard, alt: "Harvard" },
  { src: LOGOS.dark.block, alt: "Block", className: "max-h-20 max-w-32" },
  { src: LOGOS.common.mit, alt: "MIT", className: "max-h-8 max-w-12" },
  { src: LOGOS.common.toronto, alt: "Toronto", className: "max-h-12" },
  {
    src: "/logos/stanford-logo.avif",
    alt: "Stanford",
    className: "max-h-12 max-w-20",
  },
  {
    src: "/logos/media-lab-logo.webp",
    alt: "MIT Media Lab",
    className: "max-h-12 max-w-20",
  },
  {
    src: "/logos/ilab-logo.webp",
    alt: "iLab",
    className: "max-h-12 max-w-20",
  },
];

export default function LandingPage(): JSX.Element {
  const [pageView, setPageView] = useState<"student" | "teacher" | "school">(
    "teacher"
  );

  // Smooth scroll utility function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  // Handle navigation clicks
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      smoothScrollTo(href.substring(1));
    }
  };

  // Optimized scroll handling - removed empty listener for better performance
  // If you need scroll-based animations later, use IntersectionObserver instead

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GlowingStar",
    description:
      "AI-powered personalized tutoring for students that adapts to emotions and learning style. Instant photo-based grading for teachers. Making education personal and efficient.",
    url: "https://glowingstar.ai",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "GlowingStar Inc.",
      url: "https://glowingstar.ai",
    },
    featureList: [
      "Personalized AI Tutoring",
      "Emotion-Aware Learning",
      "Photo-Based Grading",
      "Instant Feedback",
    ],
    screenshot: "https://glowingstar.ai/logo.png",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="relative bg-slate-950 text-slate-100">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 top-[-40rem] h-[60rem] bg-[radial-gradient(circle_at_center,_rgba(253,224,71,0.22)_0%,_rgba(8,47,73,0)_65%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-12 sm:px-12 lg:px-16">
          <header className="flex flex-col items-center gap-6 xl:flex-row xl:items-center xl:justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 min-w-fit shrink-0 xl:self-start"
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-amber-300/40 via-yellow-100/30 to-transparent blur-lg transition-opacity duration-500 group-hover:opacity-100" />
                <Image
                  src="/glowingstar-logo.png"
                  alt="GlowingStar.AI logo"
                  width={52}
                  height={52}
                  className="relative h-14 w-14 rounded-2xl border border-white/20 bg-slate-900/60 p-1 shadow-lg"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-[0.3em] text-amber-200/90">
                  Glowingstar.ai
                </span>
                <span className="text-xl font-semibold text-slate-50">
                  AI-Powered Education
                </span>
              </div>
            </Link>

            <nav className="flex items-center justify-center gap-2 xl:justify-start xl:gap-4 text-sm text-slate-300">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="whitespace-nowrap rounded-full border border-transparent px-2.5 py-1.5 font-medium transition hover:border-amber-200/50 hover:text-amber-100 xl:px-3"
                >
                  {item.label === "Why GlowingStar" ? (
                    <>
                      <span className="xl:hidden">Why</span>
                      <span className="hidden xl:inline">Why GlowingStar</span>
                    </>
                  ) : (
                    item.label
                  )}
                </a>
              ))}
            </nav>

            <div className="flex items-center justify-center gap-3 xl:justify-start">
              {/* Toggle Switch */}
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 p-1">
                <button
                  onClick={() => setPageView("teacher")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    pageView === "teacher"
                      ? "bg-amber-300 text-slate-950 shadow-lg"
                      : "text-slate-300 hover:text-slate-100"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Teacher
                </button>
                <button
                  onClick={() => setPageView("student")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    pageView === "student"
                      ? "bg-amber-300 text-slate-950 shadow-lg"
                      : "text-slate-300 hover:text-slate-100"
                  }`}
                >
                  <Star className="h-4 w-4" />
                  Student
                </button>
                <button
                  onClick={() => setPageView("school")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    pageView === "school"
                      ? "bg-amber-300 text-slate-950 shadow-lg"
                      : "text-slate-300 hover:text-slate-100"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  School
                </button>
              </div>
              <Button
                variant="ghost"
                asChild
                className="border border-white/10 bg-white/5 text-slate-100 hover:border-amber-200/60 hover:bg-white/10 hover:text-amber-100"
              >
                <Link
                  href={
                    pageView === "student"
                      ? "/tutor-mode"
                      : pageView === "teacher"
                        ? "/emotion-console"
                        : "/emotion-console"
                  }
                >
                  Get Started
                </Link>
              </Button>
            </div>
          </header>

          <main className="mt-16 flex flex-1 flex-col gap-24 pb-12">
            <section className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
              <div className="space-y-8">
                {pageView === "student" ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-200/15 px-4 py-1 text-sm font-medium text-amber-100">
                      <Sparkles className="h-4 w-4" />
                      AI that understands how you learn
                    </span>
                    <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
                      Learning That Adapts to You
                    </h1>
                    <p className="max-w-xl text-lg text-slate-200">
                      Get a personal AI tutor that recognizes when you&apos;re
                      stuck, celebrates your breakthroughs, and adjusts to your
                      learning style in real-time. Available 24/7, whenever you
                      need help.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        asChild
                        className="bg-amber-300 text-slate-950 shadow-[0_0_32px_rgba(253,224,71,0.45)] hover:bg-amber-200"
                      >
                        <Link
                          href="/tutor-mode"
                          className="flex items-center gap-2"
                        >
                          Start Learning
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="border-slate-700 bg-slate-900/60 text-slate-200 transition hover:border-amber-200/50 hover:bg-slate-900/80 hover:text-amber-100"
                      >
                        <a
                          href="#features"
                          onClick={(e) => handleNavClick(e, "#features")}
                          className="flex items-center gap-2"
                        >
                          See Features
                          <Radar className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {studentStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-amber-200/10"
                        >
                          <p className="text-2xl font-semibold text-amber-200">
                            {stat.value}
                          </p>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : pageView === "teacher" ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-200/15 px-4 py-1 text-sm font-medium text-amber-100">
                      <Camera className="h-4 w-4" />
                      Grade in seconds, not hours
                    </span>
                    <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
                      Reclaim Your Time for Teaching
                    </h1>
                    <p className="max-w-xl text-lg text-slate-200">
                      Grade assignments in seconds, not hours. Simply snap a
                      photo of student work and get instant, detailed feedback.
                      Focus on what matters most—your students.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        asChild
                        className="bg-amber-300 text-slate-950 shadow-[0_0_32px_rgba(253,224,71,0.45)] hover:bg-amber-200"
                      >
                        <Link
                          href="/emotion-console"
                          className="flex items-center gap-2"
                        >
                          Start Grading
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="border-slate-700 bg-slate-900/60 text-slate-200 transition hover:border-amber-200/50 hover:bg-slate-900/80 hover:text-amber-100"
                      >
                        <a
                          href="#features"
                          onClick={(e) => handleNavClick(e, "#features")}
                          className="flex items-center gap-2"
                        >
                          See Features
                          <Radar className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {teacherStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-amber-200/10"
                        >
                          <p className="text-2xl font-semibold text-amber-200">
                            {stat.value}
                          </p>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-200/15 px-4 py-1 text-sm font-medium text-amber-100">
                      <Building2 className="h-4 w-4" />
                      AI native infrastructure for personalized education
                    </span>
                    <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
                      Scale Personalized Learning Across Your District
                    </h1>
                    <p className="max-w-xl text-lg text-slate-200">
                      Deploy AI-powered education infrastructure that adapts to
                      every student while giving administrators the insights
                      needed to support teachers and improve outcomes
                      district-wide.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        asChild
                        className="bg-amber-300 text-slate-950 shadow-[0_0_32px_rgba(253,224,71,0.45)] hover:bg-amber-200"
                      >
                        <Link
                          href="/emotion-console"
                          className="flex items-center gap-2"
                        >
                          Get Started
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="border-slate-700 bg-slate-900/60 text-slate-200 transition hover:border-amber-200/50 hover:bg-slate-900/80 hover:text-amber-100"
                      >
                        <a
                          href="#features"
                          onClick={(e) => handleNavClick(e, "#features")}
                          className="flex items-center gap-2"
                        >
                          See Features
                          <Radar className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {schoolStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-amber-200/10"
                        >
                          <p className="text-2xl font-semibold text-amber-200">
                            {stat.value}
                          </p>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-0 -translate-y-6 rounded-[2.5rem] bg-gradient-to-br from-amber-200/30 via-amber-500/10 to-transparent blur-3xl" />
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_80px_rgba(8,7,24,0.6)] backdrop-blur-xl">
                  <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(253,224,71,0.4),_rgba(2,6,23,0))] blur-xl" />
                  <div className="relative flex flex-col gap-6">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span className="group inline-flex items-center gap-2">
                        <span className="relative flex h-10 w-10 items-center justify-center">
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-full bg-amber-300/20 opacity-60 blur-xl transition duration-500 group-hover:opacity-90"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-[4px] rounded-full border border-amber-200/40 opacity-70 transition duration-500 group-hover:border-amber-100/80 group-hover:opacity-100"
                          />
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 origin-center animate-glow-orbit"
                          >
                            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-100 shadow-[0_0_12px_rgba(253,224,71,0.65)]" />
                          </span>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 origin-center animate-glow-orbit-fast"
                          >
                            <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_8px_rgba(253,224,71,0.45)]" />
                          </span>
                          {pageView === "student" ? (
                            <Star className="relative h-5 w-5 animate-glow-float text-amber-200 drop-shadow-[0_0_12px_rgba(253,224,71,0.65)] transition-transform duration-500 motion-reduce:animate-none group-hover:-rotate-6 group-hover:scale-110" />
                          ) : pageView === "teacher" ? (
                            <GraduationCap className="relative h-5 w-5 animate-glow-float text-amber-200 drop-shadow-[0_0_12px_rgba(253,224,71,0.65)] transition-transform duration-500 motion-reduce:animate-none group-hover:-rotate-6 group-hover:scale-110" />
                          ) : (
                            <Building2 className="relative h-5 w-5 animate-glow-float text-amber-200 drop-shadow-[0_0_12px_rgba(253,224,71,0.65)] transition-transform duration-500 motion-reduce:animate-none group-hover:-rotate-6 group-hover:scale-110" />
                          )}
                        </span>
                        {pageView === "student"
                          ? "Learning Dashboard"
                          : pageView === "teacher"
                            ? "Grading Dashboard"
                            : "District Dashboard"}
                      </span>
                      <span className="inline-flex items-center gap-2 text-amber-100">
                        <Activity className="h-4 w-4" />
                        Stable
                      </span>
                    </div>
                    {pageView === "student" ? (
                      <>
                        {/* Student Dashboard - More Visual */}
                        <div className="relative grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                          <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(253,224,71,0.6),_rgba(2,6,23,0))] opacity-70 blur-3xl" />
                          <Image
                            src="/glowingstar-logo.png"
                            alt="Glowy the Glowing Star mascot"
                            width={120}
                            height={120}
                            className="relative mx-auto h-24 w-24 drop-shadow-[0_0_45px_rgba(253,224,71,0.45)]"
                          />
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-xs font-medium text-emerald-300">
                                Learning in progress
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Heart className="h-3.5 w-3.5 text-rose-400" />
                                <span className="text-slate-300">Engaged</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Brain className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-slate-300">Focused</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {studentHighlights.map((item, index) => {
                            const icons = [Heart, Sparkles, Star];
                            const Icon = icons[index] || Star;
                            return (
                              <div
                                key={item.title}
                                className="rounded-xl border border-white/10 bg-slate-900/60 p-3 min-w-0"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                                    <Icon className="h-4 w-4 text-amber-200" />
                                  </div>
                                  <p className="font-semibold text-xs text-amber-100 leading-tight">
                                    {item.title}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : pageView === "teacher" ? (
                      <>
                        {/* Teacher Dashboard - More Visual */}
                        <div className="relative grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                          <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(253,224,71,0.6),_rgba(2,6,23,0))] opacity-70 blur-3xl" />
                          <Image
                            src="/glowingstar-logo.png"
                            alt="Glowy the Glowing Star mascot"
                            width={120}
                            height={120}
                            className="relative mx-auto h-24 w-24 drop-shadow-[0_0_45px_rgba(253,224,71,0.45)]"
                          />
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-xs font-medium text-emerald-300">
                                25 assignments graded
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-slate-300">12 min</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Camera className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-slate-300">
                                  3 flagged
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {teacherHighlights.map((item, index) => {
                            const icons = [CheckCircle2, Activity, Sparkles];
                            const Icon = icons[index] || CheckCircle2;
                            return (
                              <div
                                key={item.title}
                                className="rounded-xl border border-white/10 bg-slate-900/60 p-3 min-w-0"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                                    <Icon className="h-4 w-4 text-amber-200" />
                                  </div>
                                  <p className="font-semibold text-xs text-amber-100 leading-tight">
                                    {item.title}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* School Dashboard - More Visual */}
                        <div className="relative grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                          <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(253,224,71,0.6),_rgba(2,6,23,0))] opacity-70 blur-3xl" />
                          <Image
                            src="/glowingstar-logo.png"
                            alt="Glowy the Glowing Star mascot"
                            width={120}
                            height={120}
                            className="relative mx-auto h-24 w-24 drop-shadow-[0_0_45px_rgba(253,224,71,0.45)]"
                          />
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-xs font-medium text-emerald-300">
                                12 schools active
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-blue-400" />
                                <span className="text-slate-300">
                                  5.2K students
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-slate-300">
                                  +12% engagement
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {schoolHighlights.map((item, index) => {
                            const icons = [Building2, BarChart3, Users];
                            const Icon = icons[index] || Building2;
                            return (
                              <div
                                key={item.title}
                                className="rounded-xl border border-white/10 bg-slate-900/60 p-3 min-w-0"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                                    <Icon className="h-4 w-4 text-amber-200" />
                                  </div>
                                  <p className="font-semibold text-xs text-amber-100 leading-tight">
                                    {item.title}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Team From Section */}
            <section className="flex flex-col items-center py-8">
              <span className="text-sm text-slate-400 mb-4">Team From</span>
              <LogoCarousel logos={logoList} />
            </section>

            {/* Features Section - Dynamic based on view */}
            <section id="features" className="space-y-8">
              {pageView === "student" ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
                        Features
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-50">
                        A Tutor That Actually Gets You
                      </h2>
                    </div>
                    <p className="max-w-md text-sm text-slate-400">
                      Get personalized help that adapts to your emotions,
                      learning style, and pace. When you&apos;re stuck, it slows
                      down. When you&apos;re ready, it challenges you. Available
                      24/7.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {studentFeatures.map((feature) => (
                      <Link
                        key={feature.name}
                        href={feature.href as any}
                        className="group"
                      >
                        <div className="h-full rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-amber-200/5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-amber-300/30">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${feature.accent} px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-950`}
                          >
                            {feature.pill}
                          </div>
                          <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/70 text-amber-200">
                            <feature.icon className="h-6 w-6" />
                          </div>
                          <h3 className="mt-6 text-2xl font-semibold text-slate-50">
                            {feature.name}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {feature.description}
                          </p>
                          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-100">
                            Learn more
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : pageView === "teacher" ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
                        Features
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-50">
                        Grade in Seconds, Not Hours
                      </h2>
                    </div>
                    <p className="max-w-md text-sm text-slate-400">
                      Snap a photo of student work and get instant grades,
                      detailed feedback, and class-wide insights. Reclaim hours
                      every week to focus on teaching instead of grading.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {teacherFeatures.map((feature) => (
                      <Link
                        key={feature.name}
                        href={feature.href as any}
                        className="group"
                      >
                        <div className="h-full rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-amber-200/5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-amber-300/30">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${feature.accent} px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-950`}
                          >
                            {feature.pill}
                          </div>
                          <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/70 text-amber-200">
                            <feature.icon className="h-6 w-6" />
                          </div>
                          <h3 className="mt-6 text-2xl font-semibold text-slate-50">
                            {feature.name}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {feature.description}
                          </p>
                          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-100">
                            Learn more
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
                        Features
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold text-slate-50">
                        AI Native Infrastructure for Personalized Education
                      </h2>
                    </div>
                    <p className="max-w-md text-sm text-slate-400">
                      Deploy personalized learning across your entire district
                      with enterprise-grade infrastructure that scales from
                      individual classrooms to thousands of students.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {schoolFeatures.map((feature) => (
                      <Link
                        key={feature.name}
                        href={feature.href as any}
                        className="group"
                      >
                        <div className="h-full rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-amber-200/5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-amber-300/30">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${feature.accent} px-4 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-950`}
                          >
                            {feature.pill}
                          </div>
                          <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/70 text-amber-200">
                            <feature.icon className="h-6 w-6" />
                          </div>
                          <h3 className="mt-6 text-2xl font-semibold text-slate-50">
                            {feature.name}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {feature.description}
                          </p>
                          <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-100">
                            Learn more
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section
              id="why-glowing"
              className="grid gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 p-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:p-12"
            >
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-amber-200/80">
                  Why GlowingStar
                </p>
                <h2 className="text-3xl font-semibold text-slate-50">
                  Education That Adapts, Not the Other Way Around
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {glowTiles.map((tile) => (
                    <div
                      key={tile.title}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 flex flex-col items-center text-center"
                    >
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200/30 to-amber-400/20 text-amber-100 mb-4">
                        <tile.icon className="h-8 w-8" />
                      </div>
                      <p className="text-base font-semibold text-slate-50">
                        {tile.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center gap-6 rounded-3xl border border-white/10 bg-slate-950/60 p-8">
                <div className="flex items-center gap-3 text-sm text-amber-100 mb-2">
                  <Radar className="h-5 w-5" />
                  Our Mission
                </div>
                <p className="text-xl font-semibold text-slate-50 leading-relaxed">
                  &ldquo;Every student is a glowing star. Our job is to help
                  them shine.&rdquo;
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm font-medium text-slate-300">
                    Chenyu Zhang
                  </p>
                  <p className="text-xs text-slate-400">Founder & CEO</p>
                </div>
              </div>
            </section>
          </main>

          <footer className="mt-16 flex flex-col items-center gap-4 border-t border-white/10 pb-16 pt-8 text-center text-xs text-slate-400">
            <p>
              Making learning personal and teaching efficient, one student at a
              time.
            </p>
            <div className="flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.4em] text-slate-500">
              <span>Privacy-first</span>
              <span>Student-focused</span>
              <span>Teacher-friendly</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
