import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  buildAiMessages,
  buildChatTitle,
  findOwnedChat,
  resolveChatOwner,
  serializeChat,
  serializeMessage,
} from "@/lib/chat-server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openai";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    chatId: string;
  }>;
};

type SendMessageBody = {
  content?: string;
  toolId?: string;
  guestSessionId?: string;
};

const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  standard: 1000,
  pro: 2000,
  enterprise: 999999,
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { chatId } = await params;
    const body = (await request.json()) as SendMessageBody;
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    const owner = await resolveChatOwner({
      guestSessionId: body.guestSessionId,
      createUser: true,
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Guest session is required" },
        { status: 400 },
      );
    }

    const existingChat = await findOwnedChat(chatId, owner);

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Check quota for signed in users
    const { userId, has } = await auth();
    if (userId) {
      const planKey = has({ plan: "enterprise" })
        ? "enterprise"
        : has({ plan: "pro" })
          ? "pro"
          : "free";

      const quotaLimit = PLAN_LIMITS[planKey] ?? 1000;

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { quotaUsed: true, quotaResetAt: true },
      });

      if (user) {
        // Reset quota monthly if needed
        const now = new Date();
        if (!user.quotaResetAt || now > user.quotaResetAt) {
          const nextReset = new Date();
          nextReset.setMonth(nextReset.getMonth() + 1);
          await prisma.user.update({
            where: { clerkId: userId },
            data: { quotaUsed: 0, quotaResetAt: nextReset },
          });
          user.quotaUsed = 0;
        }

        // Block if quota exceeded
        if (user.quotaUsed >= quotaLimit) {
          return NextResponse.json(
            {
              error: "quota_exceeded",
              message: `You've used all ${quotaLimit === 999999 ? "unlimited" : quotaLimit} messages for this month. Upgrade your plan to get more.`,
              quotaUsed: user.quotaUsed,
              quotaLimit,
            },
            { status: 429 },
          );
        }
      }
    }

    const nextToolId = body.toolId ?? existingChat.toolId;
    const aiMessages = buildAiMessages(
      nextToolId,
      existingChat.messages.map(
        (message: { role: "user" | "assistant"; content: string }) => ({
          role: message.role,
          content: message.content,
        }),
      ),
      content,
    );
    const assistantContent = await generateAIResponse(aiMessages);

    await prisma.$transaction([
      prisma.chat.update({
        where: { id: existingChat.id },
        data: {
          toolId: nextToolId,
          title:
            existingChat.messages.length === 0
              ? await buildChatTitle(content)
              : existingChat.title,
        },
      }),
      prisma.message.create({
        data: {
          chatId: existingChat.id,
          role: "user",
          content,
        },
      }),
      prisma.message.create({
        data: {
          chatId: existingChat.id,
          role: "assistant",
          content: assistantContent,
        },
      }),
    ]);

    // Increment quota after successful message
    if (userId) {
      const planKey = has({ plan: "enterprise" })
        ? "enterprise"
        : has({ plan: "pro" })
          ? "pro"
          : "free";

      const quotaLimit = PLAN_LIMITS[planKey] ?? 1000;

      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          quotaUsed: { increment: 1 },
          quotaLimit,
        },
      });
    }

    const refreshedChat = await findOwnedChat(existingChat.id, owner);

    if (!refreshedChat) {
      return NextResponse.json(
        { error: "Chat could not be refreshed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      chat: serializeChat(refreshedChat),
      messages: refreshedChat.messages.map(serializeMessage),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
