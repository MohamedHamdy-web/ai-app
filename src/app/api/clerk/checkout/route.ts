import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const planId = body?.planId;
    const returnUrl =
      body?.returnUrl ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000/";

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    if (!clerkClient?.billing?.startCheckout) {
      return NextResponse.json(
        { error: "Clerk billing not available" },
        { status: 501 },
      );
    }

    // startCheckout API shape may vary depending on Clerk SDK version
    // we include userId and returnUrl where supported
    const checkout = await clerkClient.billing.startCheckout({
      planId,
      returnUrl,
      userId,
    } as any);

    const url =
      checkout?.url ??
      checkout?.checkoutUrl ??
      checkout?.redirectUrl ??
      checkout?.data?.url ??
      null;

    if (!url) {
      return NextResponse.json(
        { error: "No checkout URL returned" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to start checkout" },
      { status: 500 },
    );
  }
}
