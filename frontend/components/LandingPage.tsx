import Image from "next/image";

export default function LandingPage(): JSX.Element {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.12),_transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 shadow-2xl shadow-black/40 backdrop-blur-xl sm:px-12 sm:py-14">
          <Image
            src="/glowingstar-logo.png"
            alt="GlowingStar"
            width={80}
            height={80}
            className="mx-auto h-20 w-20 rounded-2xl"
            priority
          />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
            GlowingStar
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Coming Soon
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            We&apos;re simplifying the public site for now. More details will be
            shared when we&apos;re ready.
          </p>
        </div>
      </div>
    </main>
  );
}
