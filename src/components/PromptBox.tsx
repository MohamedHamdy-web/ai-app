"use client";

import { useState } from "react";

type Props = {
  onGenerate: (prompt: string) => void;
};

export default function PromptBox({ onGenerate }: Props) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full p-4 rounded-xl border border-gray-700 bg-transparent"
        placeholder="Write your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={() => onGenerate(prompt)}
        disabled={!prompt.trim()}
        className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:opacity-80 transition disabled:opacity-50"
      >
        Generate
      </button>
    </div>
  );
}
