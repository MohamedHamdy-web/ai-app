"use client";

import { useState } from "react";

type Props = {
  result: string;
  loading: boolean;
};

export default function ResultBox({ result, loading }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 p-6 border border-gray-800 rounded-xl min-h-37.5">
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      ) : (
        <>
          {result.includes("```") ? (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{result}</code>
            </pre>
          ) : (
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
              {result}
            </p>
          )}

          {result && (
            <button
              onClick={handleCopy}
              className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-800 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
