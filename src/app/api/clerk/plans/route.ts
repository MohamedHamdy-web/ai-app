import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!clerkClient?.billing?.getPlans) {
      return NextResponse.json(
        { error: "Clerk billing not enabled" },
        { status: 501 },
      );
    }

    const plans = await clerkClient.billing.getPlans();
    return NextResponse.json({ plans });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch Clerk plans" },
      { status: 500 },
    );
  }
}
