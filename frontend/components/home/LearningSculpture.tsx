"use client";

import { animate, useInView } from "framer-motion";
import { Pause, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import LiquidGlassIcon from "./LiquidGlassIcon";
import styles from "./home.module.css";
import useReducedEffects from "./useReducedEffects";
import type { createLearningSculpture } from "./learning-sculpture-scene";

const DURATION = 24;
type Sculpture = ReturnType<typeof createLearningSculpture>;
const concepts = [
  {
    name: "Curiosity",
    description: "Ask the question that opens a new possibility.",
  },
  {
    name: "Understanding",
    description: "Connect ideas until you can explain them in your own words.",
  },
  {
    name: "Agency",
    description: "Use what you learn to make a choice of your own.",
  },
];

/** A still, server-rendered composition also covers unavailable WebGL. */
function SculptureFallback({ active }: { active: number }): JSX.Element {
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
          stroke={active === 0 ? "url(#gs-sculpture-gold)" : "#d8d2c3"}
        />
        <ellipse
          cx="310"
          cy="325"
          rx="173"
          ry="107"
          transform="rotate(60 310 325)"
          strokeWidth="10"
          stroke={active === 1 ? "url(#gs-sculpture-gold)" : "#d8d2c3"}
        />
      </g>
      <circle cx="310" cy="325" r="61" fill="url(#gs-sculpture-pearl)" />
      <ellipse
        cx="310"
        cy="325"
        rx="146"
        ry="68"
        transform="rotate(-12 310 325)"
        stroke={active === 2 ? "url(#gs-sculpture-gold)" : "#d8d2c3"}
        strokeWidth="8"
      />
    </svg>
  );
}

export default function LearningSculpture(): JSX.Element {
  const field = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sculpture = useRef<Sculpture | null>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = useRef(0);
  const [active, setActive] = useState(0);
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

  const updateMarker = useCallback((instance: Sculpture): void => {
    if (!marker.current) return;
    const anchor = instance.getAnchor();
    marker.current.style.left = `${anchor.x * 100}%`;
    marker.current.style.top = `${anchor.y * 100}%`;
    marker.current.style.visibility = anchor.visible ? "visible" : "hidden";
  }, []);

  useEffect(() => {
    selected.current = active;
    if (sculpture.current) {
      sculpture.current.focus(active);
      updateMarker(sculpture.current);
    }
  }, [active, ready, updateMarker]);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % concepts.length;
    else if (event.key === "ArrowLeft")
      next = (active + concepts.length - 1) % concepts.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = concepts.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

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
        instance.focus(selected.current);
        const resize = (): void => {
          const { width, height } = container.getBoundingClientRect();
          instance?.resize(width, height);
          instance?.render(progress.current);
          if (instance) updateMarker(instance);
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
  }, [hasEntered, failed, updateMarker]);

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
        updateMarker(instance);
      },
    });
    playback.time = elapsed.current;
    return () => {
      elapsed.current = playback.time % DURATION;
      playback.stop();
    };
  }, [playing, updateMarker]);

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
        <SculptureFallback active={active} />
        <canvas ref={canvas} className={styles.sculptureCanvas} />
        <span ref={marker} className={styles.sculptureMarker}>
          {String(active + 1).padStart(2, "0")}
        </span>
      </div>
      <div className={styles.sculptureControls}>
        <div className={styles.sculptureControlHeading}>
          <span>Explore three dimensions of learning</span>
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
        <div
          role="tablist"
          aria-label="Dimensions of learning"
          className={styles.sculptureTabs}
        >
          {concepts.map((concept, index) => (
            <button
              key={concept.name}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`learning-concept-${index}`}
              aria-controls={`learning-concept-panel-${index}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onTabKeyDown}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {concept.name}
            </button>
          ))}
        </div>
        {concepts.map((concept, index) => (
          <p
            key={concept.name}
            role="tabpanel"
            id={`learning-concept-panel-${index}`}
            aria-labelledby={`learning-concept-${index}`}
            hidden={active !== index}
            className={styles.sculptureExplanation}
            tabIndex={0}
          >
            {concept.description}
          </p>
        ))}
      </div>
    </div>
  );
}
