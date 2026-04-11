import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await clerkClient();
    const plans = await client.billing.getPlanList();
    return NextResponse.json({ plans });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch Clerk plans" },
      { status: 500 },
    );
  }
}
