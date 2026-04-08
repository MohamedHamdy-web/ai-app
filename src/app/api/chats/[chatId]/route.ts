import { NextResponse } from "next/server";

import { findOwnedChat, resolveChatOwner, serializeChat, serializeMessage } from "@/lib/chat-server";

export const runtime = "nodejs";

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
