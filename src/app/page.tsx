"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import AppLoadingScreen from "@/components/AppLoadingScreen";
import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import PromptBox from "@/components/PromptBox";
import ResultPanel from "@/components/ResultPanel";
import History from "@/components/History";
import { tools } from "@/data/tools";
import type { ChatMessage, ChatSummary } from "@/lib/chat-types";
import { getOrCreateGuestSessionId } from "@/lib/guest-session";
import * as chatService from "@/services/chatService";

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
    [...messages].reverse().find((message) => message.role === "assistant")
      ?.id ?? null
  );
}

// use chatService.* helpers for API calls

export default function Home() {
  const { isLoaded } = useUser();
  const isCreatingInitialChatRef = useRef(false);
  const hasHandledInitialChatsRef = useRef(false);
  const chatsRef = useRef<ChatSummary[]>([]);
  const selectedChatIdRef = useRef<string | null>(null);

  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState("text");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messagesByChatId, setMessagesByChatId] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pendingAnimatedAssistantId, setPendingAnimatedAssistantId] = useState<
    string | null
  >(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? null;
  const currentMessages = selectedChatId
    ? (messagesByChatId[selectedChatId] ?? [])
    : [];
  const ownerReady = isLoaded && guestSessionId !== null;

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

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

    function handleResizeForSidebar() {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    }
    window.addEventListener("resize", handleResizeForSidebar);

    return () => {
      window.removeEventListener("scroll", updatePageScrollState);
      window.removeEventListener("resize", updatePageScrollState);
      window.removeEventListener("resize", handleResizeForSidebar);
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
      const data = await chatService.fetchChat(
        chatId,
        guestSessionId ?? undefined,
      );

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
      const nextChats = await chatService.fetchChats(
        guestSessionId ?? undefined,
      );
      const nextSelectedId = nextChats.some(
        (chat) => chat.id === selectedChatId,
      )
        ? selectedChatId
        : (nextChats[0]?.id ?? null);

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

  const createChat = useCallback(
    async (toolId: string) => {
      if (!guestSessionId) {
        throw new Error("Guest session is not ready yet");
      }

      const data = await chatService.createChat(guestSessionId, toolId);

      setChats((prev) => upsertChatSummary(prev, data.chat));
      setMessagesByChatId((prev) => ({
        ...prev,
        [data.chat.id]: data.messages,
      }));
      setSelectedChatId(data.chat.id);
      setPendingAnimatedAssistantId(null);
      setActiveTool(data.chat.toolId);

      return data.chat;
    },
    [guestSessionId],
  );

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
  }, [
    activeTool,
    chats.length,
    chatsLoading,
    createChat,
    ownerReady,
    selectedChatId,
  ]);

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

      const data = await chatService.sendMessage(
        resolvedChatId,
        guestSessionId,
        activeTool,
        input,
      );
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

  const handleRenameChat = async (chat: ChatSummary, title: string) => {
    if (!guestSessionId) {
      return false;
    }

    const proposedTitle = title.trim();

    if (!proposedTitle) {
      return false;
    }

    try {
      const renamePromise = (async () => {
        const data = await chatService.renameChat(
          chat.id,
          guestSessionId,
          proposedTitle,
        );

        setChats((prev) => upsertChatSummary(prev, data.chat));
        setMessagesByChatId((prev) => ({
          ...prev,
          [chat.id]: data.messages,
        }));

        return data.chat;
      })();

      toast.promise(renamePromise, {
        loading: "Renaming chat...",
        success: (updatedChat) => `Renamed to "${updatedChat.title}"`,
        error: (error) =>
          error instanceof Error ? error.message : "Failed to rename chat",
      });

      await renamePromise;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const deleteChat = async (chat: ChatSummary) => {
    if (!guestSessionId) {
      return;
    }

    try {
      const deletePromise = (async () => {
        await chatService.deleteChat(chat.id, guestSessionId);

        const remainingChats = chatsRef.current.filter(
          (item) => item.id !== chat.id,
        );

        setChats(remainingChats);
        setMessagesByChatId((prev) => {
          const nextMessagesByChatId = { ...prev };
          delete nextMessagesByChatId[chat.id];
          return nextMessagesByChatId;
        });

        if (selectedChatIdRef.current === chat.id) {
          const nextSelectedChat = remainingChats[0] ?? null;
          setSelectedChatId(nextSelectedChat?.id ?? null);

          if (nextSelectedChat) {
            setActiveTool(nextSelectedChat.toolId);
          }
        }

        return chat.title;
      })();

      toast.promise(deletePromise, {
        loading: `Deleting "${chat.title}"...`,
        success: (deletedTitle) => `"${deletedTitle}" was removed`,
        error: (error) =>
          error instanceof Error ? error.message : "Failed to delete chat",
      });

      await deletePromise;
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteChat = (chat: ChatSummary) => {
    if (!guestSessionId) {
      return;
    }

    const confirmationToastId = toast.warning("Delete conversation?", {
      description: `"${chat.title}" will be removed permanently from your history.`,
      duration: 12000,
      action: {
        label: "Delete",
        onClick: () => {
          toast.dismiss(confirmationToastId);
          void deleteChat(chat);
        },
      },
      cancel: {
        label: "Keep",
        onClick: () => {
          toast.dismiss(confirmationToastId);
        },
      },
    });
  };

  const handleScrollToLatest = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!isLoaded || guestSessionId === null) {
    return <AppLoadingScreen />;
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
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="flex min-h-[calc(100vh-6rem)] flex-col">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isSidebarOpen={isSidebarOpen}
        />

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
