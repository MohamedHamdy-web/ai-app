import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse } from "@/lib/openai";

export const runtime = "nodejs";

type GenerateBody = {
  prompt?: string;
};

const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  standard: 1000,
  pro: 2000,
  enterprise: 999999,
};

export async function POST(request: Request) {
  try {
    const { userId, has } = await auth();
    const body = (await request.json()) as GenerateBody;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (userId) {
      // Get or create user
      let user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: { clerkId: userId },
      });

      // Check if quota needs reset (monthly)
      const now = new Date();
      const resetAt = user.quotaResetAt;

      if (!resetAt || now > resetAt) {
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);

        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            quotaUsed: 0,
            quotaResetAt: nextReset,
          },
        });
      }

      // Read plan from Clerk directly
      const planKey = has({ plan: "enterprise" })
        ? "enterprise"
        : has({ plan: "pro" })
          ? "pro"
          : "free";

      const quotaLimit = PLAN_LIMITS[planKey] ?? 1000;

      // Sync quota limit to DB if it changed
      if (user.quotaLimit !== quotaLimit) {
        await prisma.user.update({
          where: { id: user.id },
          data: { quotaLimit },
        });
      }

      // Check if user exceeded quota
      if (user.quotaUsed >= quotaLimit) {
        return NextResponse.json(
          {
            error: "quota_exceeded",
            message: `You've used all ${quotaLimit} messages for this month. Upgrade your plan to get more.`,
            quotaUsed: user.quotaUsed,
            quotaLimit,
          },
          { status: 429 },
        );
      }

      // Generate AI response
      const result = await generateAIResponse([
        { role: "user", content: prompt },
      ]);

      // Save history + increment quota
      await Promise.all([
        prisma.history.create({
          data: { prompt, result, userId: user.id },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { quotaUsed: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ result });
    }

    // Guest user — no quota tracking
    const result = await generateAIResponse([
      { role: "user", content: prompt },
    ]);

    return NextResponse.json({ result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
