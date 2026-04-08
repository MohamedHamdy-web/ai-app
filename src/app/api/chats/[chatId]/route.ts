import { NextResponse } from "next/server";

import {
  findOwnedChat,
  resolveChatOwner,
  serializeChat,
  serializeMessage,
} from "@/lib/chat-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type UpdateChatBody = {
  guestSessionId?: string;
  title?: string;
};

type Params = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const guestSessionId = searchParams.get("guestSessionId") ?? undefined;
    const owner = await resolveChatOwner({ guestSessionId });

    if (!owner) {
      return NextResponse.json(
        { error: "Chat owner could not be resolved" },
        { status: 400 },
      );
    }

    const chat = await findOwnedChat(chatId, owner);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      chat: serializeChat(chat),
      messages: chat.messages.map(serializeMessage),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load chat" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { chatId } = await params;
    const body = (await request.json()) as UpdateChatBody;
    const owner = await resolveChatOwner({
      guestSessionId: body.guestSessionId,
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Chat owner could not be resolved" },
        { status: 400 },
      );
    }

    const existingChat = await findOwnedChat(chatId, owner);

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const nextTitle = body.title?.trim();

    if (!nextTitle) {
      return NextResponse.json(
        { error: "Chat title is required" },
        { status: 400 },
      );
    }

    const updatedChat = await prisma.chat.update({
      where: { id: existingChat.id },
      data: {
        title: nextTitle,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      chat: serializeChat(updatedChat),
      messages: updatedChat.messages.map(serializeMessage),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to rename chat" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const guestSessionId = searchParams.get("guestSessionId") ?? undefined;
    const owner = await resolveChatOwner({ guestSessionId });

    if (!owner) {
      return NextResponse.json(
        { error: "Chat owner could not be resolved" },
        { status: 400 },
      );
    }

    const existingChat = await findOwnedChat(chatId, owner);

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await prisma.chat.delete({
      where: { id: existingChat.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
