"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <nav className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Hambola Ai
        </Link>
        <p className="mt-1 text-sm text-white/60">
          Create faster with a cleaner prompt-to-result workspace.
        </p>
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
