"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PenSquare, Sparkles } from "lucide-react";

import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import ToolSelector from "@/components/ToolSelector";
import PromptBox from "@/components/PromptBox";
import ResultPanel from "@/components/ResultPanel";
import History from "@/components/History";
import { tools } from "@/data/tools";
import type { ChatMessage, ChatSummary } from "@/lib/chat-types";
import { getOrCreateGuestSessionId } from "@/lib/guest-session";

function sortChats(chats: ChatSummary[]) {
  return [...chats].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function upsertChatSummary(chats: ChatSummary[], nextChat: ChatSummary) {
  return sortChats(
    chats.filter((chat) => chat.id !== nextChat.id).concat(nextChat),
  );
}

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

  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState("text");
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messagesByChatId, setMessagesByChatId] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const activeToolData =
    tools.find((tool) => tool.id === activeTool) ?? tools[0];
  const selectedChat =
    chats.find((chat) => chat.id === selectedChatId) ?? null;
  const currentMessages = selectedChatId
    ? messagesByChatId[selectedChatId] ?? []
    : [];
  const ownerReady = isLoaded && guestSessionId !== null;

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setGuestSessionId(getOrCreateGuestSessionId());
  }, [isLoaded]);

  const loadChat = useEffectEvent(async (chatId: string) => {
    if (!guestSessionId) {
      return;
    }

    setMessagesLoading(true);

    try {
      const res = await fetch(
        `/api/chats/${chatId}?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          cache: "no-store",
        },
      );
      const data = await readJsonResponse<{
        chat: ChatSummary;
        messages: ChatMessage[];
      }>(res);

      setMessagesByChatId((prev) => ({
        ...prev,
        [chatId]: data.messages,
      }));
      setChats((prev) => upsertChatSummary(prev, data.chat));
      setActiveTool(data.chat.toolId);
    } catch (error) {
      console.error(error);
    } finally {
      setMessagesLoading(false);
    }
  });

  useEffect(() => {
    if (!ownerReady || !selectedChatId || messagesByChatId[selectedChatId]) {
      return;
    }

    void loadChat(selectedChatId);
  }, [ownerReady, selectedChatId, messagesByChatId]);

  const fetchChats = useEffectEvent(async () => {
    if (!guestSessionId) {
      return;
    }

    setChatsLoading(true);

    try {
      const res = await fetch(
        `/api/chats?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          cache: "no-store",
        },
      );
      const data = await readJsonResponse<{ chats: ChatSummary[] }>(res);
      const nextChats = data.chats ?? [];
      const nextSelectedId = nextChats.some((chat) => chat.id === selectedChatId)
        ? selectedChatId
        : nextChats[0]?.id ?? null;

      setChats(nextChats);
      setSelectedChatId(nextSelectedId);

      if (nextSelectedId && !messagesByChatId[nextSelectedId]) {
        void loadChat(nextSelectedId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChatsLoading(false);
    }
  });

  useEffect(() => {
    if (!ownerReady || !guestSessionId) {
      return;
    }

    void fetchChats();
  }, [ownerReady, guestSessionId]);

  const createChat = async (toolId: string) => {
    if (!guestSessionId) {
      throw new Error("Guest session is not ready yet");
    }

    const res = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestSessionId,
        toolId,
      }),
    });
    const data = await readJsonResponse<{
      chat: ChatSummary;
      messages: ChatMessage[];
    }>(res);

    setChats((prev) => upsertChatSummary(prev, data.chat));
    setMessagesByChatId((prev) => ({
      ...prev,
      [data.chat.id]: data.messages,
    }));
    setSelectedChatId(data.chat.id);
    setActiveTool(data.chat.toolId);

    return data.chat;
  };

  const handleCreateChat = async () => {
    try {
      await createChat(activeTool);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async (input: string) => {
    if (!guestSessionId) {
      return false;
    }

    let chatId = selectedChatId;

    try {
      if (!chatId) {
        const chat = await createChat(activeTool);
        chatId = chat.id;
      }

      const resolvedChatId = chatId;

      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: input,
        timestamp: new Date().toISOString(),
      };

      setMessagesByChatId((prev) => ({
        ...prev,
        [resolvedChatId]: [...(prev[resolvedChatId] ?? []), optimisticMessage],
      }));
      setSendingMessage(true);

      const res = await fetch(`/api/chats/${resolvedChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestSessionId,
          toolId: activeTool,
          content: input,
        }),
      });
      const data = await readJsonResponse<{
        chat: ChatSummary;
        messages: ChatMessage[];
      }>(res);

      setMessagesByChatId((prev) => ({
        ...prev,
        [resolvedChatId]: data.messages,
      }));
      setChats((prev) => upsertChatSummary(prev, data.chat));
      setSelectedChatId(resolvedChatId);
      setActiveTool(data.chat.toolId);

      return true;
    } catch (error) {
      console.error(error);

      if (chatId) {
        const failedChatId = chatId;

        setMessagesByChatId((prev) => ({
          ...prev,
          [failedChatId]: (prev[failedChatId] ?? []).filter(
            (message: ChatMessage) => !message.id.startsWith("temp-"),
          ),
        }));
      }

      return false;
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectChat = (chat: ChatSummary) => {
    setSelectedChatId(chat.id);
    setActiveTool(chat.toolId);
  };

  if (!isLoaded || guestSessionId === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Layout
      sidebar={
        <History
          chats={chats}
          selectedChatId={selectedChatId}
          loading={chatsLoading}
          onCreateChat={handleCreateChat}
          onSelect={handleSelectChat}
        />
      }
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
              Keep every chat as a separate, reusable conversation.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Start a new thread, jump back into an older one, and let each chat
              keep its own context instead of collapsing into one long history.
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
          loading={sendingMessage}
          activeTool={activeTool}
          currentChatTitle={selectedChat?.title}
        />
        <ResultPanel
          chatTitle={selectedChat?.title}
          messages={currentMessages}
          loading={messagesLoading}
          sending={sendingMessage}
          activeTool={activeTool}
        />
      </section>
    </Layout>
  );
}
