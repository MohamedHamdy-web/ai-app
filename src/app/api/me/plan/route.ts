import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();

  if (!plan) {
    return NextResponse.json({ error: "Plan is required" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { plan },
    create: {
      clerkId: userId,
      plan,
    },
  });

  return NextResponse.json({ user });
}
