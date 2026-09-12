"use client";

import {
  LazyMotion,
  MotionConfig,
  animate as animateField,
  domAnimation,
  inView,
  m,
  stagger,
  useAnimate,
  useInView,
  useScroll,
} from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./home.module.css";
import LiquidGlassIcon from "./LiquidGlassIcon";
import { LEARNING_FIELD_DURATION, learningFieldPath } from "./learning-field";
import useReducedEffects from "./useReducedEffects";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Enhance visible server-rendered content only after hydration. */
export default function HomeMotion({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reducedMotion = useReducedEffects();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!scope.current || reducedMotion) return;
    const root = scope.current;

    const controls: Array<{ stop: () => void }> = [];
    controls.push(
      animate(
        "[data-hero-enter]",
        { opacity: [0, 1], y: [18, 0] },
        {
          duration: 0.8,
          delay: stagger(0.09),
          ease: EASE,
        },
      ),
    );
    controls.push(
      animate(
        "[data-field-contours]",
        { opacity: [0, 1] },
        {
          duration: 1.6,
          delay: 0.2,
          ease: EASE,
        },
      ),
    );
    controls.push(
      animate(
        "[data-field-trace]",
        { opacity: [0, 1] },
        {
          duration: 1.1,
          delay: 0.6,
          ease: EASE,
        },
      ),
    );

    const revealTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-motion-reveal]"),
    );
    const stopObserving = inView(
      revealTargets,
      (entry) => {
        const element = entry.target as HTMLElement;
        controls.push(
          animate(
            element,
            { opacity: [0.2, 1], y: [24, 0] },
            {
              duration: 0.8,
              delay: Number((element as HTMLElement).dataset.motionDelay ?? 0),
              ease: EASE,
            },
          ),
        );
        // No leave handler: each piece of content enters once.
      },
      { amount: 0.12 },
    );

    const disclosures = Array.from(
      root.querySelectorAll<HTMLDetailsElement>("details"),
    );
    const onToggle = (event: Event): void => {
      const details = event.currentTarget as HTMLDetailsElement;
      const content = details.querySelector<HTMLElement>(
        "[data-disclosure-content]",
      );
      if (details.open && content) {
        controls.push(
          animate(
            content,
            { opacity: [0, 1], y: [-6, 0] },
            { duration: 0.28, ease: EASE },
          ),
        );
      }
    };
    disclosures.forEach((details) =>
      details.addEventListener("toggle", onToggle),
    );

    return () => {
      stopObserving();
      controls.forEach((control) => control.stop());
      disclosures.forEach((details) =>
        details.removeEventListener("toggle", onToggle),
      );
      // A preference change during an entrance must leave content fully visible.
      // Reset Motion's values too, so a queued render cannot restore a stopped
      // animation's intermediate opacity after the preference changes.
      if (root.isConnected) {
        const elements = Array.from(
          root.querySelectorAll(
            "[data-hero-enter], [data-motion-reveal], [data-field-contours], [data-field-trace], [data-disclosure-content]",
          ),
        );
        animate(elements, { opacity: 1, y: 0 }, { duration: 0 }).complete();
      }
    };
  }, [animate, reducedMotion, scope]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <div ref={scope} className={styles.page}>
          <m.div
            aria-hidden="true"
            className={styles.readingProgress}
            style={{ scaleX: scrollYProgress }}
          />
          {children}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}

/** A continuous ribbon loop with stationary annotations and explicit playback. */
export function MovingLearningField({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const reducedMotion = useReducedEffects();
  const field = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const inViewport = useInView(field, { amount: 0.15 });
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = (): void => {
      setPageVisible(document.visibilityState === "visible");
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (
      !field.current ||
      reducedMotion ||
      paused ||
      !inViewport ||
      !pageVisible
    ) {
      return;
    }

    const contours = Array.from(
      field.current.querySelectorAll<SVGPathElement>(
        "[data-field-contours] path",
      ),
    );
    const trace =
      field.current.querySelector<SVGPathElement>("[data-field-trace]");
    // One Motion clock drives every contour, so the ribbon never drifts apart.
    const playback = animateField(0, 1, {
      duration: LEARNING_FIELD_DURATION,
      ease: "linear",
      repeat: Infinity,
      onUpdate: (progress) => {
        const phase = progress * Math.PI * 2;
        contours.forEach((path, index) => {
          path.setAttribute("d", learningFieldPath(index, phase));
        });
        // A whole number of dash periods makes the flowing trace seamless too.
        trace?.setAttribute("stroke-dashoffset", String(-progress * 72));
      },
    });
    playback.time = elapsed.current;

    return () => {
      elapsed.current = playback.time % LEARNING_FIELD_DURATION;
      // Stop the frame driver offscreen; recreate at the saved phase on return.
      playback.stop();
    };
  }, [inViewport, pageVisible, paused, reducedMotion]);

  return (
    <>
      <div ref={field} className={styles.fieldMotion}>
        {children}
      </div>
      <div className={styles.fieldCaption}>
        <span>An open frontier. A human one.</span>
        {!reducedMotion && (
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
    </>
  );
}
