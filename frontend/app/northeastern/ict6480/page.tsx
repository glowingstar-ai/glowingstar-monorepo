import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Northeastern ICT6480",
};

export default function NortheasternICT6480Page(): JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-12 text-center shadow-2xl shadow-slate-950/40 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
          Northeastern
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Coming Soon</h1>
      </div>
    </main>
  );
}
