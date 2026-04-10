"use client";

import Link from "next/link";
import { PanelLeftOpen } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function Navbar({
  onOpenSidebar,
  isSidebarOpen,
}: {
  onOpenSidebar?: () => void;
  isSidebarOpen?: boolean;
}) {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <nav className="sticky top-4 z-50 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
          aria-label="Open sidebar"
          aria-controls="sidebar"
          aria-expanded={isSidebarOpen ? "true" : "false"}
        >
          <PanelLeftOpen className="h-4.5 w-4.5" />
        </button>

        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Hambola Ai
          </Link>
          <p className="mt-1 text-sm text-white/60">
            Create faster with a cleaner prompt-to-result workspace.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isLoaded && !isSignedIn ? (
          <>
            <Link
              href="/sign-in"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-85"
            >
              Sign up
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
