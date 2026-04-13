import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getToolMetadata } from "@/lib/chat-tools";
import type { ChatMessage, ChatSummary } from "@/lib/chat-types";
import { generateAIResponse } from "./openai";

type ChatOwner =
  | {
      kind: "user";
      userDbId: string;
    }
  | {
      kind: "guest";
      guestSessionId: string;
    };

type ChatWithMessages = Prisma.ChatGetPayload<{
  include: {
    messages: {
      orderBy: { createdAt: "asc" };
    };
  };
}>;

export async function resolveChatOwner(options?: {
  guestSessionId?: string;
  createUser?: boolean;
}) {
  const { guestSessionId, createUser = false } = options ?? {};
  const { userId } = await auth();

  if (userId) {
    if (createUser) {
      const user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: { clerkId: userId },
      });

      return {
        kind: "user",
        userDbId: user.id,
      } satisfies ChatOwner;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    return {
      kind: "user",
      userDbId: user.id,
    } satisfies ChatOwner;
  }

  if (!guestSessionId) {
    return null;
  }

  return {
    kind: "guest",
    guestSessionId,
  } satisfies ChatOwner;
}

export function buildChatOwnerWhere(owner: ChatOwner): Prisma.ChatWhereInput {
  if (owner.kind === "user") {
    return { userId: owner.userDbId };
  }

  return { guestSessionId: owner.guestSessionId };
}

export async function findOwnedChat(chatId: string, owner: ChatOwner) {
  return prisma.chat.findFirst({
    where: {
      id: chatId,
      ...buildChatOwnerWhere(owner),
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export function serializeChat(chat: ChatWithMessages): ChatSummary {
  const latestUserMessage = [...chat.messages]
    .reverse()
    .find((message) => message.role === "user");
  const preview = latestUserMessage?.content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  return {
    id: chat.id,
    title: chat.title,
    toolId: chat.toolId,
    preview: preview || "No question yet",
    updatedAt: chat.updatedAt.toISOString(),
    createdAt: chat.createdAt.toISOString(),
    messageCount: chat.messages.length,
  };
}

export function serializeMessage(
  message: ChatWithMessages["messages"][number],
): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
  };
}

export function buildAiMessages(
  toolId: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  content: string,
) {
  const tool = getToolMetadata(toolId);

  return [
    {
      role: "system" as const,
      content: tool.systemInstruction,
    },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    {
      role: "user" as const,
      content,
    },
  ];
}

export async function buildChatTitle(prompt: string): Promise<string> {
  try {
    const title = await generateAIResponse([
      {
        role: "system",
        content:
          "You are a title generator. Generate a short, concise title (max 5 words) for a chat based on the user's first message. Reply with ONLY the title, no quotes, no punctuation at the end, no explanation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);
    return title.trim().slice(0, 60);
  } catch {
    // fallback to truncation if AI fails
    const collapsed = prompt
      .replace(/[`#>*_~[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!collapsed) return "New chat";
    const clipped = collapsed.slice(0, 64).trim();
    return clipped.length < collapsed.length ? `${clipped}...` : clipped;
  }
}
