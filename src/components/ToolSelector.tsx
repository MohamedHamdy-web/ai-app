"use client";

import { motion } from "framer-motion";
import { Braces, Captions, FileText } from "lucide-react";

type Tool = {
  id: string;
  name: string;
  description?: string;
};

type Props = {
  tools: Tool[];
  activeTool: string;
  setActiveTool: (id: string) => void;
};

export default function ToolSelector({
  tools,
  activeTool,
  setActiveTool,
}: Props) {
  const icons = {
    text: FileText,
    code: Braces,
    caption: Captions,
  } as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tools.map((tool) => {
        const Icon = icons[tool.id as keyof typeof icons] ?? FileText;

        return (
          <motion.button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -4 }}
            className={`group rounded-[1.5rem] border p-5 text-left transition ${
              activeTool === tool.id
                ? "border-emerald-300/40 bg-emerald-300/10 shadow-lg shadow-emerald-950/30"
                : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <Icon
                  className={`h-5 w-5 ${
                    activeTool === tool.id ? "text-emerald-200" : "text-white/80"
                  }`}
                />
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${
                  activeTool === tool.id
                    ? "bg-emerald-200/15 text-emerald-100"
                    : "bg-white/8 text-white/45"
                }`}
              >
                {activeTool === tool.id ? "Active" : "Ready"}
              </span>
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">{tool.name}</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">
              {tool.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
