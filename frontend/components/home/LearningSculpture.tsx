"use client";

import { animate, useInView } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LiquidGlassIcon from "./LiquidGlassIcon";
import styles from "./home.module.css";
import useReducedEffects from "./useReducedEffects";
import type { createLearningSculpture } from "./learning-sculpture-scene";

const DURATION = 24;
type Sculpture = ReturnType<typeof createLearningSculpture>;

/** A still, server-rendered composition also covers unavailable WebGL. */
function SculptureFallback(): JSX.Element {
  return (
    <svg viewBox="0 0 620 680" fill="none" className={styles.sculptureFallback}>
      <defs>
        <linearGradient
          id="gs-sculpture-gold"
          x1="120"
          y1="130"
          x2="490"
          y2="510"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#b08634" />
          <stop offset="0.27" stopColor="#f8e7b7" />
          <stop offset="0.52" stopColor="#93661f" />
          <stop offset="0.76" stopColor="#e6c274" />
          <stop offset="1" stopColor="#aa7930" />
        </linearGradient>
        <radialGradient id="gs-sculpture-pearl" cx="35%" cy="28%" r="75%">
          <stop stopColor="#fffefa" />
          <stop offset="0.58" stopColor="#f4ead0" />
          <stop offset="0.85" stopColor="#d2bd87" />
          <stop offset="1" stopColor="#b2995f" />
        </radialGradient>
      </defs>
      <g stroke="url(#gs-sculpture-gold)">
        <ellipse
          cx="310"
          cy="325"
          rx="198"
          ry="151"
          transform="rotate(-35 310 325)"
          strokeWidth="13"
        />
        <ellipse
          cx="310"
          cy="325"
          rx="173"
          ry="107"
          transform="rotate(60 310 325)"
          strokeWidth="10"
        />
      </g>
      <circle cx="310" cy="325" r="61" fill="url(#gs-sculpture-pearl)" />
      <ellipse
        cx="310"
        cy="325"
        rx="146"
        ry="68"
        transform="rotate(-12 310 325)"
        stroke="url(#gs-sculpture-gold)"
        strokeWidth="8"
      />
    </svg>
  );
}

export default function LearningSculpture(): JSX.Element {
  const field = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sculpture = useRef<Sculpture | null>(null);
  const elapsed = useRef(0);
  const progress = useRef(0);
  const reducedMotion = useReducedEffects();
  const inViewport = useInView(field, { amount: 0.15 });
  const hasEntered = useInView(field, { amount: 0.05, once: true });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const playing =
    ready && !failed && !paused && !reducedMotion && inViewport && pageVisible;

  useEffect(() => {
    const updateVisibility = (): void =>
      setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!hasEntered || failed || !canvas.current || !field.current) return;
    const element = canvas.current;
    const container = field.current;
    let cancelled = false;
    let instance: Sculpture | undefined;
    let observer: ResizeObserver | undefined;
    const onContextLost = (): void => {
      setFailed(true);
      setReady(false);
    };
    element.addEventListener("webglcontextlost", onContextLost);

    // Load the renderer separately so the mission and still artwork render first.
    import("./learning-sculpture-scene")
      .then(({ createLearningSculpture }) => {
        if (cancelled) return;
        instance = createLearningSculpture(element);
        sculpture.current = instance;
        const resize = (): void => {
          const { width, height } = container.getBoundingClientRect();
          instance?.resize(width, height);
          instance?.render(progress.current);
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(container);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      element.removeEventListener("webglcontextlost", onContextLost);
      sculpture.current = null;
      instance?.dispose();
    };
  }, [hasEntered, failed]);

  useEffect(() => {
    const instance = sculpture.current;
    if (!playing || !instance) return;
    const playback = animate(0, 1, {
      duration: DURATION,
      ease: "linear",
      repeat: Infinity,
      onUpdate: (value) => {
        progress.current = value;
        instance.render(value);
      },
    });
    playback.time = elapsed.current;
    return () => {
      elapsed.current = playback.time % DURATION;
      playback.stop();
    };
  }, [playing]);

  return (
    <div className={styles.learningField}>
      <div
        ref={field}
        className={styles.fieldMotion}
        aria-hidden="true"
        data-hero-enter
        data-sculpture-renderer={ready && !failed ? "webgl" : "fallback"}
        data-sculpture-playing={playing}
      >
        <div className={styles.sculptureAtmosphere} />
        <SculptureFallback />
        <canvas ref={canvas} className={styles.sculptureCanvas} />
        <svg
          viewBox="0 0 620 680"
          fill="none"
          className={styles.sculptureAnnotations}
        >
          <g stroke="#c3bca6" strokeWidth="0.7" opacity="0.42">
            <path
              d="M64 150H556M64 535H556M105 106V578M515 106V578"
              strokeDasharray="1 8"
            />
            <path d="M100 150h10m-5-5v10M510 535h10m-5-5v10" />
          </g>
          <g stroke="#aa8748" strokeWidth="0.8" opacity="0.6">
            <path d="M87 462H133L163 438M445 177L480 139H537M432 483L460 511H531" />
            <circle cx="163" cy="438" r="2" fill="#aa8748" />
            <circle cx="445" cy="177" r="2" fill="#aa8748" />
            <circle cx="432" cy="483" r="2" fill="#aa8748" />
          </g>
          <g
            fill="#77613c"
            fontFamily="monospace"
            fontSize="9"
            letterSpacing="1.7"
          >
            <text x="72" y="482">
              CURIOSITY
            </text>
            <text x="480" y="128">
              AGENCY
            </text>
            <text x="433" y="532">
              UNDERSTANDING
            </text>
          </g>
        </svg>
      </div>
      <div className={styles.fieldCaption}>
        <span>Human potential. Always in motion.</span>
        {ready && !failed && !reducedMotion && (
          <button
            type="button"
            className={styles.fieldPlayback}
            onClick={() => setPaused((value) => !value)}
            aria-label={
              paused
                ? "Play illustration animation"
                : "Pause illustration animation"
            }
            title={paused ? "Play animation" : "Pause animation"}
          >
            <LiquidGlassIcon size="sm">
              {paused ? <Play /> : <Pause />}
            </LiquidGlassIcon>
          </button>
        )}
      </div>
    </div>
  );
}
