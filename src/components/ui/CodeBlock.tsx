"use client";

import { Check, Copy } from "lucide-react";
import React from "react";

type Props = {
  content: string;
  language?: string;
  activeTool?: string;
  copyKey?: string | null;
  copiedKey?: string | null;
  onCopy?: (content: string, key: string) => void;
};

export default function CodeBlock({
  content,
  language = "",
  activeTool = "code",
  copyKey = null,
  copiedKey = null,
  onCopy,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-white/10 bg-[#07131f] p-4 text-sm text-emerald-200">
      {activeTool === "code" || language ? (
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
            {language || "Code"}
          </div>

          {activeTool === "code" && onCopy ? (
            <button
              type="button"
              onClick={() => onCopy(content, copyKey ?? "")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#10202f] px-2.5 py-1.5 text-[11px] font-medium text-white/80 transition hover:bg-[#163047] hover:text-white"
            >
              {copiedKey === copyKey ? (
                <Check className="h-3.5 w-3.5 text-emerald-200" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedKey === copyKey ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
      ) : null}

      <pre>
        <code>{content}</code>
      </pre>
    </div>
  );
}
