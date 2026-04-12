import { generateAIResponse } from "./openai";

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const title = await generateAIResponse([
      {
        role: "user",
        content: `Generate a short, concise title (max 5 words) for a chat that starts with this message: "${firstMessage}". Reply with ONLY the title, no quotes, no punctuation at the end.`,
      },
    ]);
    return title.trim().slice(0, 50);
  } catch {
    return "New chat";
  }
}
