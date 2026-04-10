"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";
import { parseContent } from "@/utils/parseContent";

type Props = {
  result: string;
  loading: boolean;
};

export default function ResultBox({ result, loading }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);

  // ✨ Streaming effect
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

  return (
    <motion.div
      className="mt-8 p-6 border rounded-xl min-h-37.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🔄 Loading */}
      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      )}

      {/* ✅ Result */}
      {!loading && displayedText && (
        <motion.div
          key={result}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 📋 Copy Button */}
          <div className="flex justify-end mb-2">
            {/* ✅ Copied Feedback */}
            {copied && (
              <span className="text-green-500 text-xs ml-2">Copied!</span>
            )}
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
            >
              <Copy size={18} />
            </button>
          </div>

          {/* 🧠 Parsed Content */}
          <div className="space-y-3">
            {parseContent(displayedText).map((block, i) =>
              block.type === "code" ? (
                <div
                  key={i}
                  className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-75 overflow-y-auto text-sm"
                >
                  <pre>
                    <code>{block.content}</code>
                  </pre>
                </div>
              ) : (
                <p key={i} className="whitespace-pre-line leading-relaxed">
                  {block.content}
                </p>
              ),
            )}
          </div>

          {/* ✨ Cursor */}
          <span className="animate-pulse">|</span>
        </motion.div>
      )}
    </motion.div>
  );
}
