"use client";

import { useAuth } from "@clerk/nextjs";

export default function UserPlan() {
  const { has, isLoaded } = useAuth();

  if (!isLoaded)
    return <p className="truncate text-xs text-white/55">Loading...</p>;

  const planName = has?.({ plan: "enterprise" })
    ? "Enterprise"
    : has?.({ plan: "pro" })
      ? "Pro"
      : "Standard (Free)";

  return <p className="truncate text-xs text-white/55">{planName}</p>;
}
