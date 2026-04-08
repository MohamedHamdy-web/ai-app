export type ChatSummary = {
  id: string;
  title: string;
  toolId: string;
  preview: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};
