"use client";

import { motion } from "framer-motion";
import { Clock3, MessageSquarePlus } from "lucide-react";

import type { ChatSummary } from "@/lib/chat-types";

type Props = {
  chats: ChatSummary[];
  selectedChatId: string | null;
  loading: boolean;
  onCreateChat: () => void;
  onSelect: (chat: ChatSummary) => void;
};

function formatSidebarTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function History({
  chats,
  selectedChatId,
  loading,
  onCreateChat,
  onSelect,
}: Props) {
  return (
    <section className="flex h-full flex-col">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
              Workspace
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">Chats</h2>
          </div>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
            {chats.length}
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/58">
          Switch between saved conversations and continue them seamlessly.
        </p>

        <button
          type="button"
          onClick={onCreateChat}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {loading ? (
          <>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4"
              >
                <div className="h-4 w-2/3 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-full rounded-full bg-white/8" />
                <div className="mt-2 h-3 w-3/4 rounded-full bg-white/8" />
              </div>
            ))}
          </>
        ) : null}

        {!loading && chats.length === 0 ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.025] px-5 text-center">
            <div className="rounded-full border border-white/10 bg-white/[0.05] p-3">
              <Clock3 className="h-5 w-5 text-white/70" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No chats yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Start a new conversation and it will appear here instantly.
            </p>
          </div>
        ) : null}

        {!loading &&
          chats.map((chat) => (
          <motion.button
            key={chat.id}
            type="button"
            onClick={() => onSelect(chat)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
              selectedChatId === chat.id
                ? "border-emerald-300/40 bg-emerald-300/10"
                : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-sm font-medium leading-6 text-white">
                {chat.title}
              </p>
              <span className="shrink-0 text-[11px] text-white/35">
                {formatSidebarTime(chat.updatedAt)}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/48">
              {chat.preview}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
