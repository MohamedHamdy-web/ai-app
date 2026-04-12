import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  standard: 1000,
  pro: 2000,
  enterprise: 999999,
};

export async function GET() {
  const { userId, has } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      plan: true,
      quotaUsed: true,
      quotaLimit: true,
      quotaResetAt: true,
    },
  });

  if (!user) return NextResponse.json({ user: null });

  // Read plan from Clerk directly instead of DB
  const planKey = has({ plan: "enterprise" })
    ? "enterprise"
    : has({ plan: "pro" })
      ? "pro"
      : "free";

  const quotaLimit = PLAN_LIMITS[planKey] ?? 1000;

  return NextResponse.json({
    user: {
      ...user,
      plan: planKey,
      quotaLimit,
    },
  });
}
