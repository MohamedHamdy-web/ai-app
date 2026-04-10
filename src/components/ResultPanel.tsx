"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import type { ChatMessage } from "@/lib/chat-types";
import AssistantMessageContent from "@/components/AssistantMessageContent";
import CopyButton from "@/components/ui/CopyButton";

type Props = {
  chatTitle?: string | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  activeTool: string;
  animatedAssistantId: string | null;
  onAssistantAnimationStart: (messageId: string) => void;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

// AssistantMessageContent has been extracted to its own file

export default function ResultPanel({
  chatTitle,
  messages,
  loading,
  sending,
  activeTool,
  animatedAssistantId,
  onAssistantAnimationStart,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      messages
        .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n\n"),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeCopy = (content: string, index: string) => {
    navigator.clipboard.writeText(content.trim());
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };
  return (
    <motion.section
      className="flex min-h-[34rem] flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/15 backdrop-blur-xl sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/65">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Conversation
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {chatTitle || "Current chat"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-white/52">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 ? (
            <CopyButton copied={copied} onClick={handleCopy} />
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-3 sm:p-4">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`animate-pulse rounded-[1.25rem] border border-white/8 bg-white/[0.04] p-4 ${
                  item % 2 === 0 ? "mr-12" : "ml-12"
                }`}
              >
                <div className="h-3 w-24 rounded-full bg-white/10" />
                <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-white/8" />
              </div>
            ))}
          </div>
        ) : null}

        {!loading && messages.length === 0 ? (
          <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
              No messages yet
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">
              Start the conversation
            </h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/55">
              Your replies will appear here in a cleaner chat layout as soon as
              you send the first prompt.
            </p>
          </div>
        ) : null}

        {!loading ? (
          <div className="space-y-4">
            {messages.map((message, messageIndex) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-[1.35rem] border px-4 py-3.5 shadow-lg shadow-black/5 sm:px-5 sm:py-4 ${
                  message.role === "user"
                    ? "ml-auto max-w-3xl border-cyan-300/25 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(16,185,129,0.15))]"
                    : "mr-auto max-w-4xl border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span
                    className={`text-xs font-medium uppercase tracking-[0.18em] ${
                      message.role === "user"
                        ? "text-cyan-100/75"
                        : "text-white/45"
                    }`}
                  >
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                  <span className="text-xs text-white/35">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>

                {message.role === "assistant" ? (
                  <AssistantMessageContent
                    content={message.content}
                    activeTool={activeTool}
                    animate={animatedAssistantId === message.id}
                    messageId={message.id}
                    messageIndex={messageIndex}
                    copiedCodeIndex={copiedCodeIndex}
                    onCodeCopy={handleCodeCopy}
                    onAnimationStart={onAssistantAnimationStart}
                  />
                ) : (
                  <p className="whitespace-pre-line text-[15px] leading-7 text-white/90">
                    {message.content}
                  </p>
                )}
              </motion.div>
            ))}

            {sending ? (
              <div className="mr-auto max-w-4xl rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    Assistant
                  </span>
                  <span className="text-xs text-white/35">Thinking...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/45 [animation-delay:-0.3s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/45 [animation-delay:-0.15s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white/45" />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
