type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const MAX_HISTORY_MESSAGES = 10; // keep last 10 messages max
const MAX_CONTENT_LENGTH = 4000; // truncate long messages

function truncateMessages(messages: AiMessage[]): AiMessage[] {
  // always keep system message first
  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  // keep only last N messages
  const recentMessages = nonSystemMessages.slice(-MAX_HISTORY_MESSAGES);

  // truncate long content
  const truncated = [...systemMessages, ...recentMessages].map((m) => ({
    ...m,
    content:
      m.content.length > MAX_CONTENT_LENGTH
        ? m.content.slice(0, MAX_CONTENT_LENGTH) + "...[truncated]"
        : m.content,
  }));

  return truncated;
}

export async function generateAIResponse(messages: AiMessage[]) {
  const truncatedMessages = truncateMessages(messages);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: truncatedMessages,
        max_tokens: 2048,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Groq request failed with status ${response.status}: ${errorText}`,
    );
  }

  const data = await response.json();

  return data?.choices?.[0]?.message?.content || "No response";
}
