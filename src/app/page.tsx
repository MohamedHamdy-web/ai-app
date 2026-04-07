"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import PromptBox from "@/components/PromptBox";
import ResultBox from "@/components/ResultBox";
import { tools } from "@/data/tools";
import ToolSelector from "@/components/ToolSelector";
import { useHistory } from "@/lib/useHistory";
import History from "@/components/History";
import Layout from "@/components/Layout";

export default function Home() {
  const { history, addToHistory } = useHistory();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState("text");

  const handleGenerate = async (input: string) => {
    setLoading(true);

    const selectedTool = tools.find((t) => t.id === activeTool);

    const prompt = selectedTool?.systemPrompt(input) || input;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setResult(data.result);
      addToHistory({ prompt: input, result: data.result });
    } catch (error) {
      setResult("Error generating response");
    }

    setLoading(false);
  };

  return (
    <Layout sidebar={<History history={history} />}>
      <Navbar />

      <h1 className="text-4xl font-bold mt-6 mb-6 text-center">
        AI Content Generator
      </h1>

      <ToolSelector
        tools={tools}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      <PromptBox onGenerate={handleGenerate} />

      <ResultBox result={result} loading={loading} />
    </Layout>
  );
}
