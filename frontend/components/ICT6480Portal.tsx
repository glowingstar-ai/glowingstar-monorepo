"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudentProfile = {
  studentId: string;
  firstName: string;
  lastName: string;
};

type CheckInForm = {
  reflection: string;
  evidence: string;
  nextStep: string;
  confirmed: boolean;
};

type ModuleCompletion = CheckInForm & {
  completedAt: string;
};

const MODULE_NUMBERS = Array.from({ length: 15 }, (_, index) => index + 1);
const PROFILE_STORAGE_KEY = "ict6480.student-profile";

const emptyForm: CheckInForm = {
  reflection: "",
  evidence: "",
  nextStep: "",
  confirmed: false,
};

const progressStorageKey = (studentId: string) => `ict6480.progress.${studentId}`;

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function ICT6480Portal(): JSX.Element {
  const [studentDraft, setStudentDraft] = useState<StudentProfile>({
    studentId: "",
    firstName: "",
    lastName: "",
  });
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<Record<number, ModuleCompletion>>({});
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [checkInForm, setCheckInForm] = useState<CheckInForm>(emptyForm);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);

    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!storedProfile) return;

    try {
      const parsed = JSON.parse(storedProfile) as StudentProfile;
      if (!parsed.studentId || !parsed.firstName || !parsed.lastName) return;
      setStudent(parsed);
      setStudentDraft(parsed);
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!student) {
      setProgress({});
      setSelectedModule(1);
      setCheckInForm(emptyForm);
      return;
    }

    const storedProgress = window.localStorage.getItem(
      progressStorageKey(student.studentId)
    );

    if (!storedProgress) {
      setProgress({});
      setSelectedModule(1);
      setCheckInForm(emptyForm);
      return;
    }

    try {
      const parsed = JSON.parse(storedProgress) as Record<number, ModuleCompletion>;
      setProgress(parsed);

      const nextPendingModule =
        MODULE_NUMBERS.find((module) => !parsed[module]) ?? MODULE_NUMBERS[0];
      setSelectedModule(nextPendingModule);
    } catch {
      window.localStorage.removeItem(progressStorageKey(student.studentId));
      setProgress({});
      setSelectedModule(1);
    }
  }, [student]);

  useEffect(() => {
    if (!student) return;

    const existingCheckIn = progress[selectedModule];
    if (existingCheckIn) {
      setCheckInForm({
        reflection: existingCheckIn.reflection,
        evidence: existingCheckIn.evidence,
        nextStep: existingCheckIn.nextStep,
        confirmed: existingCheckIn.confirmed,
      });
      return;
    }

    setCheckInForm(emptyForm);
  }, [progress, selectedModule, student]);

  useEffect(() => {
    if (!student) return;

    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    if (!student) return;

    window.localStorage.setItem(
      progressStorageKey(student.studentId),
      JSON.stringify(progress)
    );
  }, [progress, student]);

  const completedCount = Object.keys(progress).length;
  const activeCompletion = progress[selectedModule];

  const handleStudentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextStudent = {
      studentId: studentDraft.studentId.trim(),
      firstName: studentDraft.firstName.trim(),
      lastName: studentDraft.lastName.trim(),
    };

    if (
      !nextStudent.studentId ||
      !nextStudent.firstName ||
      !nextStudent.lastName
    ) {
      return;
    }

    setStudent(nextStudent);
  };

  const handleCheckInSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!student) return;

    const nextCompletion: ModuleCompletion = {
      reflection: checkInForm.reflection.trim(),
      evidence: checkInForm.evidence.trim(),
      nextStep: checkInForm.nextStep.trim(),
      confirmed: checkInForm.confirmed,
      completedAt: new Date().toISOString(),
    };

    setProgress((current) => ({
      ...current,
      [selectedModule]: nextCompletion,
    }));

    const nextPendingModule = MODULE_NUMBERS.find(
      (module) => module !== selectedModule && !progress[module]
    );

    if (nextPendingModule) {
      setSelectedModule(nextPendingModule);
    }
  };

  const isCheckInComplete =
    checkInForm.reflection.trim() &&
    checkInForm.evidence.trim() &&
    checkInForm.nextStep.trim() &&
    checkInForm.confirmed;

  if (!hasHydrated) {
    return (
      <main className="min-h-screen bg-[#111113] text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Loading ICT6480
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111113] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(204,0,0,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-5">
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
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d99a9a]">
                  ICT6480 Student Portal
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Weekly Live Defense Check-In
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
                  Collect student identity, choose a module from 1 through 15,
                  and mark each weekly live defense check-in as completed.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Student
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {student
                    ? `${student.firstName} ${student.lastName}`
                    : "Not entered"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Modules Done
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {completedCount} of {MODULE_NUMBERS.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Active Module
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  Module {selectedModule}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1.2fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d99a9a]">
                    Step 1
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Student Information
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-300">
                    Ask each student to enter their student ID, first name, and
                    last name before selecting a module.
                  </p>
                </div>

                {student && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setStudent(null)}
                  >
                    Change Student
                  </Button>
                )}
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleStudentSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-neutral-200">
                    <span>Student ID</span>
                    <input
                      value={studentDraft.studentId}
                      onChange={(event) =>
                        setStudentDraft((current) => ({
                          ...current,
                          studentId: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-0 transition focus:border-[#cc0000]"
                      placeholder="e.g. 001234567"
                    />
                  </label>

                  <label className="space-y-2 text-sm text-neutral-200">
                    <span>First Name</span>
                    <input
                      value={studentDraft.firstName}
                      onChange={(event) =>
                        setStudentDraft((current) => ({
                          ...current,
                          firstName: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-0 transition focus:border-[#cc0000]"
                      placeholder="First name"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-sm text-neutral-200">
                  <span>Last Name</span>
                  <input
                    value={studentDraft.lastName}
                    onChange={(event) =>
                      setStudentDraft((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-0 transition focus:border-[#cc0000]"
                    placeholder="Last name"
                  />
                </label>

                <Button
                  type="submit"
                  className="h-11 rounded-2xl bg-[#cc0000] px-6 text-white hover:bg-[#a30000]"
                >
                  Save Student Details
                </Button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d99a9a]">
                    Step 2
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Select Module 1-15
                  </h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {completedCount} complete
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {MODULE_NUMBERS.map((module) => {
                  const isCompleted = Boolean(progress[module]);
                  const isActive = selectedModule === module;

                  return (
                    <button
                      key={module}
                      type="button"
                      disabled={!student}
                      onClick={() => setSelectedModule(module)}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-left transition",
                        "disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-neutral-500",
                        isCompleted
                          ? "border-emerald-400/40 bg-emerald-400/10"
                          : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/10",
                        isActive && "border-[#cc0000] bg-[#cc0000]/15 shadow-lg shadow-[#cc0000]/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                          Module
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-500" />
                        )}
                      </div>
                      <p className="mt-3 text-2xl font-semibold text-white">
                        {module}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                        {isCompleted ? "Done" : "Pending"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d99a9a]">
                  Step 3
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Weekly Live Defense Check-In
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                  Complete the check-in for the selected module. Once submitted,
                  the module will display as done in the interface.
                </p>
              </div>

              {activeCompletion && (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Completed {formatTimestamp(activeCompletion.completedAt)}
                </div>
              )}
            </div>

            {!student ? (
              <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-[#d99a9a]" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Enter student details first
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-400">
                  The weekly live defense check-in unlocks after a student ID,
                  first name, and last name have been entered.
                </p>
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={handleCheckInSubmit}>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                    Current Selection
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-semibold text-white">
                      Module {selectedModule}
                    </p>
                    <p className="text-sm text-neutral-300">
                      {student.firstName} {student.lastName} · {student.studentId}
                    </p>
                  </div>
                </div>

                <label className="block space-y-2 text-sm text-neutral-200">
                  <span>Defense Reflection</span>
                  <textarea
                    value={checkInForm.reflection}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        reflection: event.target.value,
                      }))
                    }
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#cc0000]"
                    placeholder="What did the student present or defend this week?"
                  />
                </label>

                <label className="block space-y-2 text-sm text-neutral-200">
                  <span>Evidence or Key Notes</span>
                  <textarea
                    value={checkInForm.evidence}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        evidence: event.target.value,
                      }))
                    }
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#cc0000]"
                    placeholder="Capture the main evidence, talking points, or outcomes."
                  />
                </label>

                <label className="block space-y-2 text-sm text-neutral-200">
                  <span>Next Step Before the Next Session</span>
                  <textarea
                    value={checkInForm.nextStep}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        nextStep: event.target.value,
                      }))
                    }
                    className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#cc0000]"
                    placeholder="What should the student prepare next?"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-neutral-200">
                  <input
                    type="checkbox"
                    checked={checkInForm.confirmed}
                    onChange={(event) =>
                      setCheckInForm((current) => ({
                        ...current,
                        confirmed: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[#cc0000]"
                  />
                  <span>
                    I confirm the Weekly Live Defense Check-In for this module
                    has been completed.
                  </span>
                </label>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-neutral-400">
                    Submitting marks Module {selectedModule} as done in the UI.
                  </p>
                  <Button
                    type="submit"
                    disabled={!isCheckInComplete}
                    className="h-11 rounded-2xl bg-[#cc0000] px-6 text-white hover:bg-[#a30000]"
                  >
                    Mark Module {selectedModule} Done
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
