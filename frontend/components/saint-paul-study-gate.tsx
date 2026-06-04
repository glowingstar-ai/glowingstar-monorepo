"use client";

import { Lock } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ADMIN_PASSWORD = "chenyuisamazing";
const STORAGE_KEY = "saintpaul-study-gate-unlocked";

type SaintPaulStudyGateProps = {
  children: ReactNode;
};

export default function SaintPaulStudyGate({
  children,
}: Readonly<SaintPaulStudyGateProps>): JSX.Element {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "true") {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage may be unavailable; fall back to locked state.
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError(false);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore persistence failures; access still granted for this view.
      }
    } else {
      setError(true);
    }
  }

  const showOverlay = !hydrated || !unlocked;

  return (
    <>
      {children}
      {showOverlay ? (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/80 px-6 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#DDD7CC] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white">
              <Lock aria-hidden className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-[#171717]">
              研究已結束
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C5C5C]">
              本研究已經結束。請輸入管理員密碼以檢視介面。
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#8A8A8A]">
              The study is over. Please enter the admin password to view the
              interface.
            </p>
            <form className="mt-6 space-y-3 text-left" onSubmit={handleSubmit}>
              <label
                htmlFor="saintpaul-admin-password"
                className="block text-sm font-medium text-[#171717]"
              >
                管理員密碼 · Admin password
              </label>
              <input
                id="saintpaul-admin-password"
                type="password"
                autoComplete="off"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) {
                    setError(false);
                  }
                }}
                className={cn(
                  "min-h-11 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#171717] outline-none transition-colors focus:border-[#171717]",
                  error ? "border-red-500" : "border-[#DDD7CC]",
                )}
                placeholder="••••••••"
              />
              {error ? (
                <p className="text-sm text-red-600">
                  密碼錯誤，請再試一次。Incorrect password, please try again.
                </p>
              ) : null}
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A]"
              >
                檢視介面 · Enter
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
