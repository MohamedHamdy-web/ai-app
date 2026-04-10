"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import UserPlan from "./user-plan";

export default function Layout({
  sidebar,
  children,
  onCreateChat,
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  onCreateChat: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.innerWidth >= 1024;
    if (isSidebarOpen && !isDesktop) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
    return;
  }, [isSidebarOpen]);
  const { isLoaded, isSignedIn, user } = useUser();
  const userName = user?.fullName || user?.firstName || "Signed-in user";
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "";
  const [appUser, setAppUser] = useState<{ id: string; plan: string } | null>(
    null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const clerk = useClerk();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setAppUser(null);
      return;
    }

    let mounted = true;

    void (async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (!mounted) return;
        setAppUser(data.user ?? null);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(34,211,238,0.12),_transparent_26%),linear-gradient(135deg,_#06131c_0%,_#0d1724_48%,_#142235_100%)] text-white">
      <div className="mx-auto relative flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        {!isSidebarOpen ? (
          <div className="hidden lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:w-[4.5rem] lg:shrink-0">
            <div className="relative flex h-full w-full flex-col items-center gap-3 rounded-[2rem] border border-white/10 bg-white/[0.045] px-3 py-4 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Open sidebar"
              >
                <PanelLeftOpen className="h-4.5 w-4.5" />
              </button>

              <button
                type="button"
                onClick={onCreateChat}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Start new chat"
              >
                <MessageSquarePlus className="h-4.5 w-4.5" />
              </button>

              {isLoaded && isSignedIn ? (
                <div className="mt-auto rounded-full border border-white/12 bg-white/[0.04] p-1">
                  <UserButton />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />

              <motion.aside
                id="sidebar"
                aria-label="Sidebar"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.22 }}
                className="fixed inset-y-0 left-0 z-40 w-[90%] max-w-[22rem] shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[22rem]"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 backdrop-blur-xl">
                  <div className="flex items-center justify-end border-b border-white/8 px-4 py-3 sm:px-5">
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                      aria-label="Close sidebar"
                    >
                      <PanelLeftClose className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                    {sidebar}
                  </div>
                  <div className="border-t border-white/8 p-4 sm:p-5">
                    {isLoaded && isSignedIn ? (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                        <div
                          className="flex items-center gap-3 relative"
                          ref={menuRef}
                        >
                          <div className="rounded-full border border-white/15 bg-white/[0.04] p-1">
                            <UserButton />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setMenuOpen((s) => !s)}
                              className="text-left"
                              aria-expanded={menuOpen}
                              aria-controls="account-menu"
                            >
                              <p className="truncate text-sm font-semibold text-white">
                                {userName}
                              </p>
                              <UserPlan />
                            </button>
                          </div>

                          {menuOpen ? (
                            <div
                              id="account-menu"
                              className="absolute bottom-full right-0 mb-3 w-48 rounded-[0.75rem] border border-white/8 bg-white/[0.035] p-2 shadow-2xl shadow-black/30"
                            >
                              <ul className="flex flex-col">
                                <li>
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/[0.02]"
                                    onClick={() => router.push("/account")}
                                  >
                                    Account settings
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/[0.02]"
                                    onClick={() => router.push("/plans")}
                                  >
                                    Upgrade plan
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/[0.02]"
                                    onClick={async () => {
                                      try {
                                        await clerk.signOut();
                                        router.refresh();
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                  >
                                    Sign out
                                  </button>
                                </li>
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-semibold text-white">
                          Guest mode
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/55">
                          Sign in to sync your chats across sessions.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href="/sign-in"
                            className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/sign-up"
                            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-85"
                          >
                            Sign up
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6 lg:min-h-[calc(100vh-3rem)] lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
