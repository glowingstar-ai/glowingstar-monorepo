"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAnimate, stagger } from "framer-motion";
import LiquidGlassIcon from "./LiquidGlassIcon";
import SculptedIcon from "./SculptedIcon";
import useReducedEffects from "./useReducedEffects";
import styles from "./home.module.css";

const links = [
  { href: "#mission", label: "Mission" },
  { href: "#research", label: "Research" },
  { href: "#work", label: "Our work" },
  { href: "#about", label: "About" },
];

export default function HomeNavigation(): JSX.Element {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [navigationRef, animate] = useAnimate<HTMLElement>();
  const reducedMotion = useReducedEffects();

  useEffect(() => {
    if (!open || reducedMotion || !navigationRef.current) return;
    const links = Array.from(navigationRef.current.querySelectorAll("a"));
    const controls = animate(
      links,
      { opacity: [0, 1], y: [-6, 0] },
      {
        duration: 0.26,
        delay: stagger(0.035),
        ease: [0.22, 1, 0.36, 1],
      },
    );
    return () => {
      controls.stop();
      if (links.some((link) => link.isConnected)) {
        animate(links, { opacity: 1, y: 0 }, { duration: 0 }).complete();
      }
    };
  }, [open, reducedMotion, animate, navigationRef]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 62.5625rem)");
    const closeOnResize = (): void => setOpen(false);
    desktop.addEventListener("change", closeOnResize);
    return () => desktop.removeEventListener("change", closeOnResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent): void => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link
          className={styles.wordmark}
          href="/"
          aria-label="GlowingStar home"
          onClick={() => setOpen(false)}
        >
          <LiquidGlassIcon size="lg">
            <SculptedIcon kind="star" size={32} />
          </LiquidGlassIcon>{" "}
          GlowingStar
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className={styles.menuToggle}
          aria-expanded={open}
          aria-controls="home-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          <LiquidGlassIcon size="lg">
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </LiquidGlassIcon>
        </button>
        <nav
          ref={navigationRef}
          id="home-navigation"
          className={styles.navigation}
          data-open={open}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a
            className={styles.navContact}
            href="#contact"
            onClick={() => setOpen(false)}
          >
            Get in touch{" "}
            <LiquidGlassIcon size="sm">
              <ArrowUpRight aria-hidden="true" />
            </LiquidGlassIcon>
          </a>
        </nav>
      </div>
    </header>
  );
}
