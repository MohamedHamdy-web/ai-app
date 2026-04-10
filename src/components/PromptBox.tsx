"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, Plus, SendHorizontal } from "lucide-react";

type Props = {
  onGenerate: (prompt: string) => Promise<boolean>;
  loading: boolean;
  activeTool: string;
  setActiveTool: (id: string) => void;
  tools: Array<{
    id: string;
    name: string;
  }>;
};

const toolCopy: Record<
  string,
  {
    label: string;
    placeholder: string;
  }
> = {
  text: {
    label: "Writing",
    placeholder:
      "Describe the topic, audience, tone, and any key points you want covered.",
  },
  code: {
    label: "Code",
    placeholder:
      "Explain the feature, framework, constraints, and the exact output you want.",
  },
  caption: {
    label: "Caption",
    placeholder:
      "Describe the post, the audience, and the kind of energy you want in the captions.",
  },
};

export default function PromptBox({
  onGenerate,
  loading,
  activeTool,
  setActiveTool,
  tools,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeCopy = useMemo(
    () => toolCopy[activeTool] ?? toolCopy.text,
    [activeTool],
  );
  const activeToolLabel =
    tools.find((tool) => tool.id === activeTool)?.name ?? "Text Generator";

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

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSubmit();
    }
  };

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,24,0.96),rgba(10,22,34,0.92))] p-3 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-4">
      <div className="relative rounded-[1.35rem] border border-white/10 bg-black/25 p-3">
        <textarea
          className="min-h-20 max-h-56 w-full resize-y rounded-2xl border border-white/10 bg-white/3 p-4 text-[15px] leading-7 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/45 focus:bg-white/4.5"
          placeholder={activeCopy.placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm text-white/75 transition hover:bg-white/8 hover:text-white"
              aria-label="Choose model"
            >
              <Plus className="h-4 w-4" />
              <span className="max-w-36 truncate">{activeToolLabel}</span>
              <ChevronDown
                className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen ? (
              <div className="absolute bottom-12 left-0 z-20 min-w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setActiveTool(tool.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/78 transition hover:bg-white/8 hover:text-white"
                  >
                    <span>{tool.name}</span>
                    {tool.id === activeTool ? (
                      <Check className="h-4 w-4 text-emerald-200" />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Send message"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
