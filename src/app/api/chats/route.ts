import { NextResponse } from "next/server";

import {
  buildChatOwnerWhere,
  resolveChatOwner,
  serializeChat,
  serializeMessage,
} from "@/lib/chat-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CreateChatBody = {
  guestSessionId?: string;
  toolId?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestSessionId = searchParams.get("guestSessionId") ?? undefined;
    const owner = await resolveChatOwner({ guestSessionId });

    if (!owner) {
      return NextResponse.json({ chats: [] });
    }

    const chats = await prisma.chat.findMany({
      where: buildChatOwnerWhere(owner),
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      chats: chats.map(serializeChat),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load chats" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateChatBody;
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

    const chat = await prisma.chat.create({
      data:
        owner.kind === "user"
          ? {
              toolId: body.toolId ?? "text",
              userId: owner.userDbId,
            }
          : {
              toolId: body.toolId ?? "text",
              guestSessionId: owner.guestSessionId,
            },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      chat: serializeChat(chat),
      messages: chat.messages.map(serializeMessage),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }
}
