import { NextResponse } from "next/server";

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

    const nextToolId = body.toolId ?? existingChat.toolId;
    const aiMessages = buildAiMessages(
      nextToolId,
      existingChat.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
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
              ? buildChatTitle(content)
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
