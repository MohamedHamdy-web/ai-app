"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

type Item = {
  prompt: string;
  result: string;
};

type Props = {
  history: Item[];
  onSelect: (item: Item) => void;
};

export default function History({ history, onSelect }: Props) {
  return (
    <section className="flex h-full flex-col">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
              Workspace
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">History</h2>
          </div>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
            {history.length}
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/58">
          Reopen previous prompts and results from the same sidebar.
        </p>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {history.length === 0 ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.025] px-5 text-center">
            <div className="rounded-full border border-white/10 bg-white/[0.05] p-3">
              <Clock3 className="h-5 w-5 text-white/70" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No saved runs yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Generate something new and it will appear here for quick reuse.
            </p>
          </div>
        ) : null}

        {history.map((item, i) => (
          <motion.button
            key={`${item.prompt}-${i}`}
            type="button"
            onClick={() => onSelect(item)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <p className="text-sm font-medium leading-6 text-white">
              {item.prompt}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/48">
              {item.result}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
