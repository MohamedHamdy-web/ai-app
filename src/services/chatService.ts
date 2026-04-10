import type { ChatMessage, ChatSummary } from "@/lib/chat-types";
import { readJsonResponse } from "@/utils/fetchHelpers";

export async function fetchChats(guestSessionId?: string) {
  const url = guestSessionId
    ? `/api/chats?guestSessionId=${encodeURIComponent(guestSessionId)}`
    : `/api/chats`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await readJsonResponse<{ chats: ChatSummary[] }>(res);
  return data.chats ?? [];
}

export async function fetchChat(chatId: string, guestSessionId?: string) {
  const url = guestSessionId
    ? `/api/chats/${chatId}?guestSessionId=${encodeURIComponent(guestSessionId)}`
    : `/api/chats/${chatId}`;

  const res = await fetch(url, { cache: "no-store" });
  return await readJsonResponse<{ chat: ChatSummary; messages: ChatMessage[] }>(
    res,
  );
}

export async function createChat(guestSessionId: string, toolId?: string) {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestSessionId, toolId }),
  });

  return await readJsonResponse<{ chat: ChatSummary; messages: ChatMessage[] }>(
    res,
  );
}

export async function sendMessage(
  chatId: string,
  guestSessionId: string,
  toolId: string,
  content: string,
) {
  const res = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestSessionId, toolId, content }),
  });

  return await readJsonResponse<{ chat: ChatSummary; messages: ChatMessage[] }>(
    res,
  );
}

export async function renameChat(
  chatId: string,
  guestSessionId: string,
  title: string,
) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestSessionId, title }),
  });

  return await readJsonResponse<{ chat: ChatSummary; messages: ChatMessage[] }>(
    res,
  );
}

export async function deleteChat(chatId: string, guestSessionId: string) {
  const res = await fetch(
    `/api/chats/${chatId}?guestSessionId=${encodeURIComponent(guestSessionId)}`,
    { method: "DELETE" },
  );

  return await readJsonResponse<{ success: boolean }>(res);
}
