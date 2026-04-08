import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  children: ReactNode;
};

const highlights = [
  "Generate content immediately, even without an account.",
  "Save your history automatically once you sign in.",
  "Use one clean workspace for prompts, results, and revisions.",
];

export default function AuthShell({
  badge,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternateText,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_32%),linear-gradient(135deg,#06131c_0%,#0d1724_45%,#142235_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[36px_36px] opacity-25" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.2em] uppercase"
          >
            Hambola Ai
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Back home
          </Link>
        </header>

        <div className="flex flex-1 items-center py-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="max-w-2xl">
              <div className="mb-5 inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100">
                {badge}
              </div>

              <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                {title}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
                {description}
              </p>

              <div className="mt-8 grid gap-3">
                {highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-white/80 backdrop-blur-sm"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </section>

            <section className="mx-auto w-full max-w-md rounded-4xl border border-white/12 bg-white/8 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="rounded-3xl border border-white/12 bg-slate-950/65 p-6 sm:p-8">
                {children}

                <p className="mt-6 text-center text-sm text-white/65">
                  {alternateText}{" "}
                  <Link
                    href={alternateHref}
                    className="font-medium text-emerald-300 transition hover:text-emerald-200"
                  >
                    {alternateLabel}
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
