"use client";

import { useEffect, useState } from "react";

type QuotaData = {
  quotaUsed: number;
  quotaLimit: number;
  plan: string | null;
};

async function fetchQuota(): Promise<QuotaData | null> {
  try {
    const res = await fetch("/api/me");
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export default function QuotaBar() {
  const [quota, setQuota] = useState<QuotaData | null>(null);

  useEffect(() => {
    fetchQuota().then(setQuota);

    // Listen for quota refresh events
    function onRefresh() {
      fetchQuota().then(setQuota);
    }

    window.addEventListener("quota:refresh", onRefresh);
    return () => window.removeEventListener("quota:refresh", onRefresh);
  }, []);

  if (!quota) return null;

  const percentage = Math.min((quota.quotaUsed / quota.quotaLimit) * 100, 100);
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  return (
    <div className="px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">Messages this month</span>
        <span
          className={`text-xs font-medium ${
            isDanger
              ? "text-red-400"
              : isWarning
                ? "text-yellow-400"
                : "text-emerald-400"
          }`}
        >
          {quota.quotaUsed} /{" "}
          {quota.quotaLimit === 999999 ? "∞" : quota.quotaLimit}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            isDanger
              ? "bg-red-500"
              : isWarning
                ? "bg-yellow-500"
                : "bg-emerald-500"
          }`}
          style={{
            width: quota.quotaLimit === 999999 ? "10%" : `${percentage}%`,
          }}
        />
      </div>
      {isDanger && (
        <p className="text-xs text-red-400 mt-1.5">
          Almost out!{" "}
          <a
            href="/plans"
            className="underline hover:text-red-300 transition-colors"
          >
            Upgrade now
          </a>
        </p>
      )}
    </div>
  );
}
