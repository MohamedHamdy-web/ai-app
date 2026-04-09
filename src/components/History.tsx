"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Clock3,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import type { ChatSummary } from "@/lib/chat-types";

type Props = {
  chats: ChatSummary[];
  selectedChatId: string | null;
  loading: boolean;
  onCreateChat: () => void;
  onDeleteChat: (chat: ChatSummary) => void;
  onRenameChat: (chat: ChatSummary, title: string) => Promise<boolean>;
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
  onDeleteChat,
  onRenameChat,
  onSelect,
}: Props) {
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [renamePending, setRenamePending] = useState(false);

  useEffect(() => {
    if (!editingChatId) {
      return;
    }

    if (!chats.some((chat) => chat.id === editingChatId)) {
      setEditingChatId(null);
      setEditingTitle("");
      setRenamePending(false);
    }
  }, [chats, editingChatId]);

  const closeRename = () => {
    if (renamePending) {
      return;
    }

    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleStartRename = (chat: ChatSummary) => {
    setOpenMenuChatId(null);
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleRenameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    chat: ChatSummary,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeRename();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      void handleRenameSubmit(chat);
    }
  };

  const handleRenameSubmit = async (chat: ChatSummary) => {
    const nextTitle = editingTitle.trim();

    if (!nextTitle) {
      return;
    }

    if (nextTitle === chat.title) {
      closeRename();
      return;
    }

    setRenamePending(true);

    try {
      const didRename = await onRenameChat(chat, nextTitle);

      if (didRename) {
        setEditingChatId(null);
        setEditingTitle("");
      }
    } finally {
      setRenamePending(false);
    }
  };

  return (
    <section className="flex h-full flex-col">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
              Workspace
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">Chats</h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/58">
          Switch between saved conversations and continue them seamlessly.
        </p>

        <button
          type="button"
          onClick={() => {
            setOpenMenuChatId(null);
            onCreateChat();
          }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div
        className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:hover:bg-white/25 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.18) transparent",
        }}
      >
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
            <motion.div
              key={chat.id}
              whileHover={editingChatId === chat.id ? undefined : { y: -2 }}
              whileTap={editingChatId === chat.id ? undefined : { scale: 0.99 }}
              className={`rounded-[1.35rem] border p-4 transition ${
                selectedChatId === chat.id
                  ? "border-emerald-300/40 bg-emerald-300/10"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              {editingChatId === chat.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100/70">
                      Rename chat
                    </span>
                    <span className="shrink-0 text-[11px] text-white/35">
                      {formatSidebarTime(chat.updatedAt)}
                    </span>
                  </div>

                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onKeyDown={(event) => handleRenameKeyDown(event, chat)}
                    disabled={renamePending}
                    className="w-full rounded-2xl border border-emerald-300/25 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/45"
                    placeholder="Conversation title"
                    aria-label="Rename chat"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-white/45">
                      Press Enter to save or Escape to cancel.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeRename}
                        disabled={renamePending}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                        aria-label="Cancel rename"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRenameSubmit(chat)}
                        disabled={!editingTitle.trim() || renamePending}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Check className="h-4 w-4" />
                        {renamePending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuChatId(null);
                      onSelect(chat);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate pr-2 text-sm font-medium leading-6 text-white">
                        {chat.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-white/35">
                        {formatSidebarTime(chat.updatedAt)}
                      </span>
                    </div>
                  </button>

                  <div className="relative mt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuChatId((current) =>
                          current === chat.id ? null : chat.id,
                        );
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                      aria-label={`Open actions for ${chat.title}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {openMenuChatId === chat.id ? (
                      <div className="absolute right-0 top-11 z-20 min-w-36 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <button
                          type="button"
                          onClick={() => handleStartRename(chat)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/78 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuChatId(null);
                            onDeleteChat(chat);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-100 transition hover:bg-rose-300/12"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </motion.div>
          ))}
      </div>
    </section>
  );
}
