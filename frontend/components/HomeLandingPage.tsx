import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import HomeNavigation from "@/components/home/HomeNavigation";
import styles from "@/components/home/home.module.css";
import HomeMotion from "@/components/home/HomeMotion";
import LearningSculpture from "@/components/home/LearningSculpture";
import LearningExperience from "@/components/home/LearningExperience";
import SculptedIcon, {
  type SculptedIconKind,
} from "@/components/home/SculptedIcon";
import LiquidGlassIcon from "@/components/home/LiquidGlassIcon";

const CONTACT_HREF = "mailto:support@glowingstar.ai";

const researchDirections = [
  {
    number: "01",
    icon: "understanding" as SculptedIconKind,
    category: "Understanding",
    title: "Learning that lasts.",
    description:
      "How can AI help people build understanding they can carry into the next problem, and the world beyond the screen?",
    detail:
      "We explore tutoring, practice, and feedback that ask learners to reason for themselves. Our research asks what people retain and can apply independently after the interaction ends.",
    tags: "Reasoning · Retention · Transfer",
  },
  {
    number: "02",
    icon: "metacognition" as SculptedIconKind,
    category: "Metacognition",
    title: "Knowing what you know.",
    description:
      "When an answer feels convincing, does understanding follow? We study the relationship between confidence and capability.",
    detail:
      "By looking at assessments alongside learners’ confidence and conversations, we investigate where perceived understanding and demonstrated knowledge come apart, and how learning systems can help close that gap.",
    tags: "Confidence · Reflection · Calibration",
  },
  {
    number: "03",
    icon: "agency" as SculptedIconKind,
    category: "Agency",
    title: "People in the driver’s seat.",
    description:
      "What does AI look like when it strengthens our curiosity, judgment, and ability to direct our own learning?",
    detail:
      "We explore how learners choose their goals, question suggestions, and decide when to ask for help. Educators remain central to the design of meaningful learning experiences.",
    tags: "Curiosity · Choice · Human judgment",
  },
];

export default function HomeLandingPage(): JSX.Element {
  return (
    <HomeMotion>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <HomeNavigation />

      <main id="main-content" tabIndex={-1}>
        <section
          className={`${styles.hero} ${styles.container}`}
          aria-labelledby="hero-heading"
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow} data-hero-enter>
              <span className={styles.statusDot} /> GlowingStar · Research &
              applied AI
            </p>
            <h1 id="hero-heading">
              <span data-hero-enter>Frontier lab</span>{" "}
              <span data-hero-enter>for human</span>{" "}
              <em data-hero-enter>learning.</em>
            </h1>
            <p className={styles.heroMission} data-hero-enter>
              We work to ensure that as machines get smarter, humans do too.
            </p>
            <a className={styles.primaryLink} href="#mission" data-hero-enter>
              Explore our mission{" "}
              <LiquidGlassIcon tone="dark">
                <ArrowDown aria-hidden="true" />
              </LiquidGlassIcon>
            </a>
          </div>
          <LearningSculpture />
          <div className={styles.heroFootnote}>
            <span>Human curiosity. Scientific rigor. Shared progress.</span>
            <span className={styles.heroIndex}>A new frontier / 001</span>
          </div>
        </section>

        <section
          id="mission"
          className={`${styles.mission} ${styles.container}`}
          aria-labelledby="mission-heading"
        >
          <div className={styles.sectionRail}>
            <p className={styles.eyebrow}>01 / Our conviction</p>
            <SculptedIcon
              kind="curiosity"
              size={112}
              className={styles.railSculpture}
            />
          </div>
          <div>
            <h2 id="mission-heading" data-motion-reveal>
              The next breakthrough
              <br />
              should be <em>human.</em>
            </h2>
            <div className={styles.missionBody} data-motion-reveal>
              <p>
                AI is changing what machines can do. We ask what it can help
                people become.
              </p>
              <div>
                <p>
                  Access to an answer is only the beginning. Learning means
                  building the understanding to ask a better question, the
                  judgment to challenge an idea, and the confidence to act on
                  what you know.
                </p>
                <p>
                  GlowingStar brings research and product development together
                  to explore how AI can expand that capacity. We start with
                  learning, because it shapes everything we become capable of.
                </p>
                <Link className={styles.textLink} href="/manifesto">
                  Read our founding manifesto{" "}
                  <LiquidGlassIcon size="sm">
                    <ArrowUpRight aria-hidden="true" />
                  </LiquidGlassIcon>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="research"
          className={`${styles.research} ${styles.container}`}
          aria-labelledby="research-heading"
        >
          <div className={styles.sectionHeading} data-motion-reveal>
            <p className={styles.eyebrow}>02 / Research directions</p>
            <div>
              <h2 id="research-heading">
                A science of
                <br />
                <em>becoming more capable.</em>
              </h2>
              <p>
                Three questions guide the systems we build and the learning
                experiences we study.
              </p>
            </div>
          </div>
          <div className={styles.researchList}>
            {researchDirections.map((direction, index) => (
              <details
                className={styles.researchItem}
                key={direction.number}
                data-motion-reveal
                data-motion-delay={index * 0.07}
              >
                <summary>
                  <span className={styles.researchNumber}>
                    <SculptedIcon
                      kind={direction.icon}
                      size={64}
                      className={styles.researchSculpture}
                    />
                  </span>
                  <span className={styles.researchTitle}>
                    <span className={styles.eyebrow}>
                      {direction.number} / {direction.category}
                    </span>
                    <h3>{direction.title}</h3>
                  </span>
                  <span className={styles.researchDescription}>
                    {direction.description}
                  </span>
                  <LiquidGlassIcon className={styles.expandControl}>
                    <Plus
                      className={styles.expandIcon}
                      size={21}
                      strokeWidth={1.3}
                      aria-hidden="true"
                    />
                  </LiquidGlassIcon>
                </summary>
                <div className={styles.researchDetail} data-disclosure-content>
                  <p>{direction.detail}</p>
                  <span>{direction.tags}</span>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section
          id="work"
          className={styles.work}
          aria-labelledby="work-heading"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeading} data-motion-reveal>
              <p className={styles.eyebrow}>03 / Research meets reality</p>
              <div>
                <h2 id="work-heading">
                  Built to learn.
                  <br />
                  <em>Grounded in the world.</em>
                </h2>
              </div>
            </div>
            <div className={styles.workGrid}>
              <div className={styles.workCopy} data-motion-reveal>
                <span className={styles.workLabel}>
                  <span className={styles.statusDot} /> Our first proving ground
                </span>
                <h3>
                  The GlowingStar
                  <br />
                  learning platform.
                </h3>
                <p>
                  Our AI tutoring platform brings these questions into real
                  classrooms. We build learning experiences, study how students
                  use them, and bring what we learn back into the next design.
                </p>
                <p>
                  Assessments, conversations, and learner confidence help us
                  examine both what a system enables and where it falls short.
                </p>
                <a
                  className={styles.textLink}
                  href={`${CONTACT_HREF}?subject=Learning%20research%20partnership`}
                >
                  Partner with us{" "}
                  <LiquidGlassIcon size="sm" tone="dark">
                    <ArrowUpRight aria-hidden="true" />
                  </LiquidGlassIcon>
                </a>
              </div>
              <LearningExperience />
            </div>
            <div className={styles.researchPrinciple}>
              <span className={styles.eyebrow}>Our standard</span>
              <p>
                Progress is what a person can understand and do after the
                conversation ends.
              </p>
            </div>
          </div>
        </section>

        <section
          id="about"
          className={`${styles.about} ${styles.container}`}
          aria-labelledby="about-heading"
        >
          <div className={styles.sectionRail}>
            <p className={styles.eyebrow}>04 / The people behind the work</p>
            <SculptedIcon
              kind="connection"
              size={112}
              className={styles.railSculpture}
            />
          </div>
          <div>
            <h2 id="about-heading" data-motion-reveal>
              Researchers. Builders.
              <br />
              <em>Learners, always.</em>
            </h2>
            <p className={styles.aboutDescription} data-motion-reveal>
              We bring together perspectives from AI, education, and human
              development. The people building our learning systems also help
              ask the questions those systems need to answer.
            </p>
            <p className={styles.affiliationsLabel}>
              Our team’s academic and professional backgrounds include
            </p>
            <ul
              className={styles.affiliations}
              aria-label="Team backgrounds"
              data-motion-reveal
            >
              <li>Harvard</li>
              <li>MIT</li>
              <li>Stanford</li>
              <li>University of Toronto</li>
            </ul>
            <p className={styles.affiliationNote}>
              Institutions listed reflect team backgrounds, not institutional
              partnerships or endorsements.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className={styles.contact}
          aria-labelledby="contact-heading"
        >
          <div className={`${styles.container} ${styles.contactInner}`}>
            <div>
              <div className={styles.contactSignature}>
                <SculptedIcon kind="star" size={68} />
                <p className={styles.eyebrow}>The frontier is open</p>
              </div>
              <h2 id="contact-heading" data-motion-reveal>
                Let’s advance
                <br />
                <em>human potential.</em>
              </h2>
            </div>
            <div
              className={styles.contactCopy}
              data-motion-reveal
              data-motion-delay="0.1"
            >
              <p>
                If you’re asking what AI could make possible for human learning,
                we’d like to meet you.
              </p>
              <p>
                We welcome conversations with researchers, educators, builders,
                and institutions.
              </p>
              <a className={styles.primaryLink} href={CONTACT_HREF}>
                Start a conversation{" "}
                <LiquidGlassIcon tone="dark">
                  <ArrowUpRight aria-hidden="true" />
                </LiquidGlassIcon>
              </a>
              <a className={styles.emailLink} href={CONTACT_HREF}>
                support@glowingstar.ai
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={`${styles.footer} ${styles.container}`}>
        <div>
          <Link
            className={styles.wordmark}
            href="/"
            aria-label="GlowingStar home"
          >
            <LiquidGlassIcon size="lg">
              <SculptedIcon kind="star" size={32} />
            </LiquidGlassIcon>{" "}
            GlowingStar
          </Link>
          <p>A frontier lab for human learning.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href={CONTACT_HREF}>
            Contact{" "}
            <LiquidGlassIcon size="sm">
              <ArrowUpRight aria-hidden="true" />
            </LiquidGlassIcon>
          </a>
        </nav>
        <span className={styles.copyright}>
          © {new Date().getFullYear()} GlowingStar, Inc.
        </span>
      </footer>
    </HomeMotion>
  );
}
