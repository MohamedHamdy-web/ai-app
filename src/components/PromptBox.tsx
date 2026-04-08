"use client";

import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

type Props = {
  onGenerate: (prompt: string) => Promise<boolean>;
  loading: boolean;
  activeTool: string;
  currentChatTitle?: string | null;
};

const promptIdeas: Record<string, string[]> = {
  text: [
    "Write a confident product introduction for an AI writing app.",
    "Summarize why remote teams need a better async workflow.",
    "Draft a short landing page section for a design studio.",
  ],
  code: [
    "Build a reusable React card component with TypeScript props.",
    "Explain how debounce works with a simple JavaScript example.",
    "Create a Next.js API route that validates request input.",
  ],
  caption: [
    "A behind-the-scenes photo from a product launch shoot.",
    "A morning coffee post for a founder building in public.",
    "A gym transformation reel with a confident tone.",
  ],
};

const toolCopy: Record<
  string,
  {
    eyebrow: string;
    title: string;
    placeholder: string;
  }
> = {
  text: {
    eyebrow: "Editorial Mode",
    title: "Shape a clean brief before you generate.",
    placeholder:
      "Describe the topic, audience, tone, and any key points you want covered.",
  },
  code: {
    eyebrow: "Builder Mode",
    title: "Give the model enough context to write useful code.",
    placeholder:
      "Explain the feature, framework, constraints, and the exact output you want.",
  },
  caption: {
    eyebrow: "Social Mode",
    title: "Feed it a scene, a vibe, and a platform.",
    placeholder:
      "Describe the post, the audience, and the kind of energy you want in the captions.",
  },
};

export default function PromptBox({
  onGenerate,
  loading,
  activeTool,
  currentChatTitle,
}: Props) {
  const [prompt, setPrompt] = useState("");

  const activeCopy = useMemo(
    () => toolCopy[activeTool] ?? toolCopy.text,
    [activeTool],
  );
  const ideas = useMemo(
    () => promptIdeas[activeTool] ?? promptIdeas.text,
    [activeTool],
  );

  const handleSubmit = async () => {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt || loading) {
      return;
    }

    const wasSent = await onGenerate(normalizedPrompt);

    if (wasSent) {
      setPrompt("");
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/15 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/65">
            <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
            {activeCopy.eyebrow}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            {activeCopy.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Clear prompts produce sharper outputs. Set the goal, audience, and
            constraints so the result already feels close to finished.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          <div className="font-medium">Current Chat</div>
          <div className="mt-1 max-w-52 truncate text-emerald-50/80">
            {currentChatTitle || "A new chat will start"}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-3">
        <textarea
          className="min-h-[16rem] w-full resize-none rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-5 text-base leading-7 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/45"
          placeholder={activeCopy.placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="mt-5">
        <div className="text-sm font-medium text-white/75">Try one of these</div>
        <div className="mt-3 flex flex-wrap gap-3">
          {ideas.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setPrompt(idea)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-white/50">
          You can use the app freely in guest mode, then sign in later to keep
          your history synced.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!prompt.trim() || loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Wand2 className="h-4 w-4" />
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </section>
  );
}
