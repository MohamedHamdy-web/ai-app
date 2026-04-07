import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await generateAIResponse(prompt);

    return NextResponse.json({ result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
