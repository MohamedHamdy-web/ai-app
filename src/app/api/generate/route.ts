import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openai";

export const runtime = "nodejs";

type GenerateBody = {
  prompt?: string;
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    // 👤 find user
    const body = (await request.json()) as GenerateBody;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const result = await generateAIResponse([
      {
        role: "user",
        content: prompt,
      },
    ]);

    if (userId) {
      const user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: { clerkId: userId },
      });

      await prisma.history.create({
        data: {
          prompt,
          result,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
