"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
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

function getLatestAssistantMessageId(messages: ChatMessage[]) {
  return (
    [...messages].reverse().find((message) => message.role === "assistant")?.id ??
    null
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
  const isCreatingInitialChatRef = useRef(false);
  const hasHandledInitialChatsRef = useRef(false);

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
  const [pendingAnimatedAssistantId, setPendingAnimatedAssistantId] =
    useState<string | null>(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);

  const selectedChat =
    chats.find((chat) => chat.id === selectedChatId) ?? null;
  const currentMessages = selectedChatId
    ? messagesByChatId[selectedChatId] ?? []
    : [];
  const ownerReady = isLoaded && guestSessionId !== null;

  const updatePageScrollState = useCallback(() => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScrollTop = doc.scrollHeight - window.innerHeight;
    const hasOverflow = maxScrollTop > 24;
    const effectiveBottomThreshold = maxScrollTop > 100 ? 100 : 24;
    const shouldShow =
      hasOverflow && maxScrollTop - scrollTop > effectiveBottomThreshold;

    setShowScrollToBottomButton((currentValue) =>
      currentValue === shouldShow ? currentValue : shouldShow,
    );
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setGuestSessionId(getOrCreateGuestSessionId());
  }, [isLoaded]);

  useEffect(() => {
    updatePageScrollState();

    window.addEventListener("scroll", updatePageScrollState, {
      passive: true,
    });
    window.addEventListener("resize", updatePageScrollState);

    return () => {
      window.removeEventListener("scroll", updatePageScrollState);
      window.removeEventListener("resize", updatePageScrollState);
    };
  }, [updatePageScrollState]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior:
          currentMessages.length > 0 || sendingMessage ? "smooth" : "auto",
      });
      updatePageScrollState();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    currentMessages.length,
    selectedChatId,
    sendingMessage,
    messagesLoading,
    updatePageScrollState,
  ]);

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
      setPendingAnimatedAssistantId(null);
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

  const createChat = useCallback(async (toolId: string) => {
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
    setPendingAnimatedAssistantId(null);
    setActiveTool(data.chat.toolId);

    return data.chat;
  }, [guestSessionId]);

  useEffect(() => {
    if (
      !ownerReady ||
      chatsLoading ||
      hasHandledInitialChatsRef.current ||
      isCreatingInitialChatRef.current
    ) {
      return;
    }

    if (chats.length > 0 || selectedChatId) {
      hasHandledInitialChatsRef.current = true;
      return;
    }

    hasHandledInitialChatsRef.current = true;
    isCreatingInitialChatRef.current = true;

    void createChat(activeTool)
      .catch((error) => {
        console.error(error);
        hasHandledInitialChatsRef.current = false;
      })
      .finally(() => {
        isCreatingInitialChatRef.current = false;
      });
  }, [activeTool, chats.length, chatsLoading, createChat, ownerReady, selectedChatId]);

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
      const latestAssistantMessageId = getLatestAssistantMessageId(
        data.messages,
      );

      setPendingAnimatedAssistantId(latestAssistantMessageId);
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
    setPendingAnimatedAssistantId(null);
    setSelectedChatId(chat.id);
    setActiveTool(chat.toolId);
  };

  const handleAssistantAnimationStart = useCallback((messageId: string) => {
    setPendingAnimatedAssistantId((currentId) =>
      currentId === messageId ? null : currentId,
    );
  }, []);

  const handleRenameChat = async (chat: ChatSummary) => {
    if (!guestSessionId) {
      return;
    }

    const proposedTitle = window.prompt("Rename chat", chat.title)?.trim();

    if (!proposedTitle || proposedTitle === chat.title) {
      return;
    }

    try {
      const res = await fetch(`/api/chats/${chat.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestSessionId,
          title: proposedTitle,
        }),
      });
      const data = await readJsonResponse<{
        chat: ChatSummary;
        messages: ChatMessage[];
      }>(res);

      setChats((prev) => upsertChatSummary(prev, data.chat));
      setMessagesByChatId((prev) => ({
        ...prev,
        [chat.id]: data.messages,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteChat = async (chat: ChatSummary) => {
    if (!guestSessionId) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete "${chat.title}"? This conversation will be removed permanently.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const res = await fetch(
        `/api/chats/${chat.id}?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          method: "DELETE",
        },
      );
      await readJsonResponse<{ success: boolean }>(res);

      const remainingChats = chats.filter((item) => item.id !== chat.id);

      setChats(remainingChats);
      setMessagesByChatId((prev) => {
        const nextMessagesByChatId = { ...prev };
        delete nextMessagesByChatId[chat.id];
        return nextMessagesByChatId;
      });

      if (selectedChatId === chat.id) {
        const nextSelectedChat = remainingChats[0] ?? null;
        setSelectedChatId(nextSelectedChat?.id ?? null);

        if (nextSelectedChat) {
          setActiveTool(nextSelectedChat.toolId);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleScrollToLatest = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
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
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onSelect={handleSelectChat}
        />
      }
      onCreateChat={handleCreateChat}
    >
      <div className="flex min-h-[calc(100vh-6rem)] flex-col">
        <Navbar />

        <section className="mt-6 flex flex-1 flex-col gap-4">
          <div className="flex-1">
            <ResultPanel
              chatTitle={selectedChat?.title}
              messages={currentMessages}
              loading={messagesLoading}
              sending={sendingMessage}
              activeTool={activeTool}
              animatedAssistantId={pendingAnimatedAssistantId}
              onAssistantAnimationStart={handleAssistantAnimationStart}
            />
          </div>

          <div className="sticky bottom-4 z-20 mt-auto">
            <AnimatePresence>
              {showScrollToBottomButton ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="mb-3 flex justify-center"
                >
                  <button
                    type="button"
                    onClick={handleScrollToLatest}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1f2a37]/90 text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-[#293547] hover:text-white"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <PromptBox
              onGenerate={handleGenerate}
              loading={sendingMessage}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              tools={tools}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}
