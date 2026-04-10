"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function LoadingCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[1.35rem] border border-white/10 bg-white/4  p-4 shadow-lg shadow-black/10 ${className}`}
    >
      <div className="h-3 w-24 rounded-full bg-white/10" />
      <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-white/8" />
      <div className="mt-2 h-4 w-2/3 rounded-full bg-white/8" />
    </div>
  );
}

export default function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.14),transparent_24%),linear-gradient(135deg,#06131c_0%,#0d1724_48%,#142235_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-400 flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="hidden lg:block lg:w-88 lg:shrink-0">
          <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-4xl border border-white/10 bg-white/4.5 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-3 h-7 w-28 rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-full rounded-full bg-white/8" />
              <div className="mt-2 h-4 w-5/6 rounded-full bg-white/8" />
              <div className="mt-5 h-11 w-full rounded-2xl bg-white/12" />
            </div>

            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((item) => (
                <LoadingCard key={item} />
              ))}
            </div>

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/4 p-4">
              <div className="h-4 w-28 rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-full rounded-full bg-white/8" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-white/8" />
              <div className="mt-4 flex gap-2">
                <div className="h-9 flex-1 rounded-xl bg-white/10" />
                <div className="h-9 flex-1 rounded-xl bg-white/14" />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6 lg:min-h-[calc(100vh-3rem)] lg:p-8"
          >
            <motion.div
              aria-hidden="true"
              animate={{
                opacity: [0.35, 0.7, 0.35],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY }}
              className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.16),transparent_60%)]"
            />

            <div className="relative">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/4.5 px-5 py-4 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="h-6 w-32 rounded-full bg-white/10" />
                    <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-white/8" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 w-24 rounded-xl bg-white/10" />
                    <div className="h-10 w-24 rounded-xl bg-white/14" />
                  </div>
                </div>
              </div>

              <section className="mt-6 flex flex-col gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/4.5 p-5 shadow-xl shadow-black/15">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Loading workspace
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                      <div className="h-8 w-64 max-w-full rounded-full bg-white/10" />
                      <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
                      <div className="mt-2 h-4 w-11/12 rounded-full bg-white/8" />
                      <div className="mt-2 h-4 w-4/5 rounded-full bg-white/8" />

                      <div className="mt-6 space-y-3">
                        <LoadingCard className="mr-10" />
                        <LoadingCard className="ml-10" />
                        <LoadingCard className="mr-16" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,24,0.94),rgba(10,22,34,0.88))] p-5">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                          Session setup
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                          Preparing your chats, tools, and session state
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
                          We&apos;re connecting your workspace so the current
                          chat, history, and prompt tools all arrive together.
                        </p>
                      </div>

                      <div className="mt-6 space-y-3">
                        {[
                          "Resolving your session",
                          "Loading recent conversations",
                          "Syncing the active workspace",
                        ].map((label, index) => (
                          <motion.div
                            key={label}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.08 * index,
                              duration: 0.25,
                              ease: "easeOut",
                            }}
                            className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/4 px-4 py-3"
                          >
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10">
                              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-200" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">
                                {label}
                              </p>
                              <p className="text-xs text-white/45">
                                Just a moment...
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,24,0.96),rgba(10,22,34,0.92))] p-4 shadow-2xl shadow-black/25">
                  <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-3">
                    <div className="min-h-20 rounded-2xl border border-white/10 bg-white/3 p-4">
                      <div className="h-4 w-4/5 rounded-full bg-white/10" />
                      <div className="mt-3 h-4 w-11/12 rounded-full bg-white/8" />
                      <div className="mt-3 h-4 w-2/3 rounded-full bg-white/8" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="h-10 w-36 rounded-xl bg-white/10" />
                      <div className="h-11 w-11 rounded-xl bg-white/14" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
