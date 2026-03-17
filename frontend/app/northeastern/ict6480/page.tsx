import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Northeastern ICT6480",
};

export default function NortheasternICT6480Page(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#f5f5f3] px-6 text-[#111111]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center py-20">
        <div className="w-full max-w-2xl rounded-[2rem] border border-black/8 bg-white px-8 py-12 text-center shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:px-12">
          <div className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-4">
            <Image
              src="/logos/northeastern-university-logo.png"
              alt="Northeastern University"
              width={320}
              height={74}
              className="h-12 w-auto"
              priority
            />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-[#d99a9a]">
            ICT6480
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl">
            Coming Soon
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
            This page is being simplified for now. More details will be shared
            when ready.
          </p>
        </div>
      </div>
    </main>
  );
}
