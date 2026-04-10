"use client";

import { Check, Copy } from "lucide-react";
import React from "react";

type Props = {
  copied?: boolean;
  onClick: () => void;
  className?: string;
  label?: string;
};

export default function CopyButton({
  copied = false,
  onClick,
  className = "",
  label = "Copy",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white ${className}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-200" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
