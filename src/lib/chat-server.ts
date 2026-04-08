import { auth } from "@clerk/nextjs/server";
import { MessageRole, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getToolMetadata } from "@/lib/chat-tools";
import type { ChatMessage, ChatSummary } from "@/lib/chat-types";

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
    .find((message) => message.role === MessageRole.user);
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
  history: Array<{ role: MessageRole; content: string }>,
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

export function buildChatTitle(prompt: string) {
  const collapsedPrompt = prompt
    .replace(/[`#>*_~[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!collapsedPrompt) {
    return "New chat";
  }

  const clippedPrompt = collapsedPrompt.slice(0, 64).trim();

  if (clippedPrompt.length < collapsedPrompt.length) {
    return `${clippedPrompt}...`;
  }

  return clippedPrompt;
}
