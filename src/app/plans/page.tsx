"use client";

import { PricingTable } from "@clerk/nextjs";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8" style={{ background: "#0d1f1f" }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{
            background: "rgba(124, 58, 237, 0.15)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            color: "#a78bfa",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
        </div>
        <h1 className="text-5xl font-extrabold mb-4 text-white">
          Choose the plan that&apos;s{" "}
          <span
            style={{
              background: "linear-gradient(to right, #7c3aed, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            right for you
          </span>
        </h1>
        <p className="text-lg max-w-xl mx-auto text-white/60">
          Start free and scale as you grow. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <PricingTable
          appearance={{
            variables: {
              colorPrimary: "#10b981",
              colorBackground: "#0f2d2d",
              colorForeground: "#ffffff",
              colorMutedForeground: "#6ee7b7",
              colorNeutral: "#ffffff",
              borderRadius: "1rem",
            },
          }}
        />
      </div>

      <p className="text-center text-sm mt-8 text-white/30">
        All paid plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  );
}
