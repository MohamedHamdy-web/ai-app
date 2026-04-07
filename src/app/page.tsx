"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import PromptBox from "@/components/PromptBox";
import ResultBox from "@/components/ResultBox";

export default function Home() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setResult(data.result);
    } catch (error) {
      setResult("Error generating response");
    }

    setLoading(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6">
      <Navbar />

      <h1 className="text-4xl font-bold mt-16 mb-6 text-center">
        AI Content Generator
      </h1>

      <PromptBox onGenerate={handleGenerate} />

      <ResultBox result={result} loading={loading} />
    </main>
  );
}
