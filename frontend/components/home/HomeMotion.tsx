"use client";

import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  inView,
  m,
  stagger,
  useAnimate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, type PointerEvent, type ReactNode } from "react";
import styles from "./home.module.css";
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

/** Small, input-driven movements instead of an always-running background loop. */
export function MovingLearningField({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const reducedMotion = useReducedEffects();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(pointerY, { stiffness: 100, damping: 24 });
  const rotateY = useSpring(pointerX, { stiffness: 100, damping: 24 });
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 700], [0, -28]);

  const resetPointer = (): void => {
    pointerX.set(0);
    pointerY.set(0);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 9);
    pointerY.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 9);
  };

  return (
    <div
      className={styles.fieldMotion}
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <m.div
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          y: reducedMotion ? 0 : lift,
        }}
      >
        {children}
      </m.div>
    </div>
  );
}
