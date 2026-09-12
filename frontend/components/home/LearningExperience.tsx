"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
import { useState, type PointerEvent } from "react";
import SculptedIcon from "@/components/home/SculptedIcon";
import useReducedEffects from "@/components/home/useReducedEffects";
import styles from "@/components/home/learning-experience.module.css";

const steps = [
  {
    id: "question",
    label: "Question",
    note: "A question of your own gives learning a direction.",
  },
  {
    id: "reflect",
    label: "Reflect",
    note: "A good prompt makes room for the learner’s own reasoning.",
  },
  {
    id: "understand",
    label: "Understand",
    note: "Try a new example to see what you can explain independently.",
  },
] as const;

type StepId = (typeof steps)[number]["id"];

export default function LearningExperience(): JSX.Element {
  const [activeStep, setActiveStep] = useState<StepId>("reflect");
  const reducedMotion = useReducedEffects();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(pointerY, { stiffness: 110, damping: 24 });
  const rotateY = useSpring(pointerX, { stiffness: 110, damping: 24 });
  const activeNote = steps.find((step) => step.id === activeStep)?.note;

  function resetTilt(): void {
    pointerX.set(0);
    pointerY.set(0);
  }

  function updateTilt(event: PointerEvent<HTMLDivElement>): void {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 6);
    pointerY.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 6);
  }

  return (
    <div
      className={styles.experience}
      data-motion-reveal
      data-motion-delay="0.12"
      data-learning-experience
    >
      <div className={styles.heading}>
        <SculptedIcon kind="star" size={35} />
        <div>
          <p>A moment of learning</p>
          <span>Illustrative exchange</span>
        </div>
        <span className={styles.headingIndex} aria-hidden="true">
          01 → 03
        </span>
      </div>

      <div
        className={styles.perspective}
        onPointerMove={updateTilt}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
      >
        <m.div
          className={styles.stack}
          style={{
            rotateX: reducedMotion ? 0 : rotateX,
            rotateY: reducedMotion ? 0 : rotateY,
          }}
        >
          <div className={styles.backSheet} aria-hidden="true" />
          <article
            className={`${styles.card} ${styles.question}`}
            data-active={activeStep === "question"}
            id="learning-question"
          >
            <div className={styles.cardHeading}>
              <span className={styles.speaker}>Learner</span>
              <span className={styles.cardIndex}>01 / Question</span>
            </div>
            <p className={styles.learnerQuestion}>
              If AI can give me the answer, why do I need to understand it?
            </p>
          </article>

          <article
            className={`${styles.card} ${styles.reflect}`}
            data-active={activeStep === "reflect"}
            id="learning-reflect"
          >
            <div className={styles.cardHeading}>
              <span className={styles.speaker}>
                <SculptedIcon kind="star" size={23} />
                GlowingStar
              </span>
              <span className={styles.cardIndex}>02 / Reflect</span>
            </div>
            <p className={styles.tutorResponse}>
              Let’s start with a different question. How would you know if the
              answer was wrong?
            </p>
          </article>

          <article
            className={`${styles.card} ${styles.understand}`}
            data-active={activeStep === "understand"}
            id="learning-understand"
          >
            <div className={styles.practiceIcon}>
              <SculptedIcon kind="understanding" size={43} />
            </div>
            <div>
              <p className={styles.cardIndex}>03 / Understand</p>
              <p className={styles.practicePrompt}>
                Explain it in your own words.
                <br />
                Then try a new example.
              </p>
            </div>
          </article>
        </m.div>
      </div>

      <div
        className={styles.stepControls}
        role="group"
        aria-label="Explore the learning steps"
      >
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            aria-pressed={activeStep === step.id}
            aria-controls={`learning-${step.id}`}
            className={styles.stepButton}
            onClick={() => setActiveStep(step.id)}
          >
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            {step.label}
          </button>
        ))}
      </div>
      <p className={styles.stepNote} role="status" aria-live="polite">
        {activeNote}
      </p>
    </div>
  );
}
