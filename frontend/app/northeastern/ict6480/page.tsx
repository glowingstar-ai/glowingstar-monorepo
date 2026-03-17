import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Northeastern ICT6480",
};

export default function NortheasternICT6480Page(): JSX.Element {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111113] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(204,0,0,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center py-20">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-black/30 px-8 py-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-12">
          <div className="inline-flex rounded-2xl bg-white px-5 py-4">
            <Image
              src="/logos/northeastern-primary.svg"
              alt="Northeastern University"
              width={280}
              height={64}
              className="h-10 w-auto"
              priority
            />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-[#d99a9a]">
            ICT6480
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Coming Soon
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-300 sm:text-base">
            This page is being simplified for now. More details will be shared
            when ready.
          </p>
        </div>
      </div>
    </main>
  );
}
