import { randomUUID } from "crypto";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
  };
  citations?: Array<{ title: string; source: string }>;
}

class ModelChatRepository {
  private readonly history = new Map<string, ChatMessage[]>();

  getHistory(modelId: string): ChatMessage[] {
    return this.history.get(modelId) ?? [];
  }

  add(modelId: string, message: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
    const entry: ChatMessage = {
      ...message,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };

    const existing = this.history.get(modelId) ?? [];
    this.history.set(modelId, [...existing, entry]);
    return entry;
  }
}

export const modelChatRepository = new ModelChatRepository();
