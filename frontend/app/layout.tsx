import "./globals.css";
import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import {
  dmSans,
  inter,
  manrope,
  outfit,
  playfairDisplay,
  plexSans,
  plusJakartaSans,
} from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "GlowingStar",
    template: "%s | GlowingStar",
  },
  description:
    "GlowingStar is a frontier lab for human learning. We work to ensure that as machines get smarter, humans do too.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`antialiased ${inter.variable} ${manrope.variable} ${plexSans.variable} ${dmSans.variable} ${plusJakartaSans.variable} ${outfit.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
