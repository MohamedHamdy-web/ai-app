import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ history: [] });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { history: true },
    });

    if (!user) {
      return NextResponse.json({ history: [] });
    }

    return NextResponse.json({
      history: user.history.reverse(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
