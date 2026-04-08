"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  result: string;
  loading: boolean;
  activeTool: string;
};

function parseContent(text: string) {
  const parts = text.split(/```/);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const trimmedPart = part.trim();
      const newlineIndex = trimmedPart.indexOf("\n");

      if (newlineIndex === -1) {
        return { type: "code", content: trimmedPart, language: "" };
      }

      const firstLine = trimmedPart.slice(0, newlineIndex).trim();
      const rest = trimmedPart.slice(newlineIndex + 1);
      const languagePattern = /^[a-zA-Z0-9_+-]+$/;

      if (languagePattern.test(firstLine)) {
        return { type: "code", content: rest, language: firstLine };
      }

      return { type: "code", content: trimmedPart, language: "" };
    }

    return { type: "text", content: part };
  });
}

export default function ResultPanel({ result, loading, activeTool }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!result) {
      setDisplayedText("");
      return;
    }

    let i = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + result.charAt(i));
      i++;

      if (i >= result.length) {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content.trim());
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <motion.section
      className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/15 backdrop-blur-xl sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/65">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Output
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Generated result
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Your response appears here with formatted text and code blocks.
          </p>
        </div>

        {result ? (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.1] hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-200" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded-full bg-white/12" />
            <div className="h-4 w-full rounded-full bg-white/8" />
            <div className="h-4 w-10/12 rounded-full bg-white/8" />
            <div className="h-28 rounded-[1.25rem] bg-white/6" />
            <div className="h-4 w-8/12 rounded-full bg-white/8" />
          </div>
        ) : null}

        {!loading && !displayedText ? (
          <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
              Ready when you are
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-white">
              Start with a strong prompt
            </h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/55">
              Choose a tool, describe what you need, and the result will appear
              here with a cleaner reading layout.
            </p>
          </div>
        ) : null}

        {!loading && displayedText ? (
          <motion.div
            key={result}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-4">
              {parseContent(displayedText).map((block, i) =>
                block.type === "code" ? (
                  <div
                    key={i}
                    className="overflow-x-auto rounded-[1.25rem] border border-white/10 bg-[#07131f] p-4 text-sm text-emerald-200"
                  >
                    {activeTool === "code" || block.language ? (
                      <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                          {block.language || "Code"}
                        </div>

                        {activeTool === "code" ? (
                          <button
                            type="button"
                            onClick={() => handleCodeCopy(block.content, i)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#10202f] px-2.5 py-1.5 text-[11px] font-medium text-white/80 transition hover:bg-[#163047] hover:text-white"
                          >
                            {copiedCodeIndex === i ? (
                              <Check className="h-3.5 w-3.5 text-emerald-200" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            {copiedCodeIndex === i ? "Copied" : "Copy"}
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    <pre>
                      <code>{block.content}</code>
                    </pre>
                  </div>
                ) : (
                  <p
                    key={i}
                    className="whitespace-pre-line text-[15px] leading-8 text-white/84"
                  >
                    {block.content}
                  </p>
                ),
              )}
            </div>

            <span className="mt-3 inline-block animate-pulse text-cyan-200">|</span>
          </motion.div>
        ) : null}
      </div>
    </motion.section>
  );
}
