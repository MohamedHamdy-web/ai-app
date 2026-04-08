"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PenSquare, Sparkles } from "lucide-react";

import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import ToolSelector from "@/components/ToolSelector";
import PromptBox from "@/components/PromptBox";
import ResultPanel from "@/components/ResultPanel";
import History from "@/components/History";

import { tools } from "@/data/tools";

type HistoryItem = {
  prompt: string;
  result: string;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (contentType.includes("application/json")) {
      const errorData = (await response.json()) as { error?: string };
      message = errorData.error || message;
    } else {
      const errorText = await response.text();
      message = errorText || message;
    }

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    const preview = (await response.text()).slice(0, 120);
    throw new Error(`Expected JSON response, received: ${preview}`);
  }

  return (await response.json()) as T;
}

export default function Home() {
  const { isLoaded } = useUser();

  const [activeTool, setActiveTool] = useState("text");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const activeToolData =
    tools.find((tool) => tool.id === activeTool) ?? tools[0];

  // 🔥 Fetch history from DB
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history", { cache: "no-store" });
        const data = await readJsonResponse<{ history?: HistoryItem[] }>(res);

        setHistory(data.history || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
  }, [isLoaded]);

  // 🔥 Generate AI
  const handleGenerate = async (input: string) => {
    setLoading(true);

    const selectedTool = tools.find((t) => t.id === activeTool);
    const prompt = selectedTool?.systemPrompt(input) || input;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await readJsonResponse<{ result: string }>(res);

      setResult(data.result);

      // ✅ update history instantly
      setHistory((prev) => [{ prompt: input, result: data.result }, ...prev]);
    } catch (error) {
      console.error(error);
      setResult("Error generating response");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Click history → load result
  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item.result);
  };

  // 🔐 Protect page
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Layout
      sidebar={<History history={history} onSelect={handleSelectHistory} />}
    >
      <Navbar />

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_26%),rgba(255,255,255,0.03)] p-6 shadow-2xl shadow-black/15 sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/65">
              <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
              AI Workspace
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Build polished outputs from a calmer, sharper home screen.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Switch between writing, code, and social content workflows,
              generate instantly, and keep your best ideas within reach.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
              <PenSquare className="h-5 w-5 text-emerald-200" />
              <div className="mt-4 text-2xl font-semibold text-white">
                {tools.length}
              </div>
              <div className="mt-1 text-sm text-white/55">Creation modes</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Choose a creation mode
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Current focus: {activeToolData.name.toLowerCase()}
            </p>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/65 lg:block">
            {activeToolData.description}
          </div>
        </div>

        <ToolSelector
          tools={tools}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
        />
      </section>

      <section className="mt-6 space-y-6">
        <PromptBox
          onGenerate={handleGenerate}
          loading={loading}
          activeTool={activeTool}
        />
        <ResultPanel
          result={result}
          loading={loading}
          activeTool={activeTool}
        />
      </section>
    </Layout>
  );
}
