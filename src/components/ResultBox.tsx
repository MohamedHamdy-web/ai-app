"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

type Props = {
  result: string;
  loading: boolean;
};

export default function ResultBox({ result, loading }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 p-6 border border-gray-800 rounded-xl min-h-37.5 relative">
      {/* 🔄 Loading */}
      {loading && (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      )}

      {/* ✅ Result */}
      {!loading && result && (
        <div className="relative">
          {/* 📋 Copy Button (Top Right) */}
          <button
            onClick={handleCopy}
            className="absolute top-0 right-0 p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Copy size={18} />
          </button>

          {/* 🧠 Result Content */}
          {result.includes("```") ? (
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm mt-6">
              <code>{result}</code>
            </pre>
          ) : (
            <p className="text-gray-300 whitespace-pre-line leading-relaxed pt-8">
              {result}
            </p>
          )}

          {/* ✅ Copied Feedback */}
          {copied && (
            <span className="text-green-400 text-xs absolute top-2 right-10">
              Copied!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
