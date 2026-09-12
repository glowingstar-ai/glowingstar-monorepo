import type { ReactNode } from "react";
import styles from "./liquid-glass.module.css";

type LiquidGlassIconProps = {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  className?: string;
};

export default function LiquidGlassIcon({
  children,
  size = "md",
  tone = "light",
  className,
}: LiquidGlassIconProps): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={[styles.glass, styles[size], styles[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
