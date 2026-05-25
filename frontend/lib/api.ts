import type { Agent, ChatMessage, DashboardOverview, ModelDeployment } from "@/types/domain";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://shahid-vontobel-api.azurewebsites.net"
    : "http://localhost:4000");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    try {
      return await request<DashboardOverview>("/api/dashboard/overview");
    } catch {
      return {
        totalModels: 12,
        activeAgents: 7,
        tokenUsage: 3489000,
        monthlyCost: 24730,
        recentDeployments: [],
        recentChats: [],
        health: { healthy: 9, degraded: 2, offline: 1 }
      };
    }
  }
};

export const modelsApi = {
  list: (): Promise<ModelDeployment[]> => request<ModelDeployment[]>("/api/models"),
  create: (payload: { name: string; model: ModelDeployment["model"]; region: string }): Promise<ModelDeployment> =>
    request<ModelDeployment>("/api/models", { method: "POST", body: JSON.stringify(payload) }),
  remove: (id: string): Promise<void> => request<void>(`/api/models/${id}`, { method: "DELETE" })
};

export const agentsApi = {
  list: (): Promise<Agent[]> => request<Agent[]>("/api/agents"),
  create: (payload: Omit<Agent, "id" | "createdAt" | "status">): Promise<Agent> =>
    request<Agent>("/api/agents", { method: "POST", body: JSON.stringify(payload) })
};

export const modelChatApi = {
  history: (modelId: string): Promise<ChatMessage[]> => request<ChatMessage[]>(`/api/model-chat/history/${modelId}`),
  send: (modelId: string, message: string): Promise<ChatMessage> =>
    request<ChatMessage>("/api/model-chat", { method: "POST", body: JSON.stringify({ modelId, message }) })
};

export const agentChatApi = {
  history: (agentId: string): Promise<ChatMessage[]> => request<ChatMessage[]>(`/api/agent-chat/history/${agentId}`),
  send: (agentId: string, message: string): Promise<ChatMessage> =>
    request<ChatMessage>("/api/agent-chat", { method: "POST", body: JSON.stringify({ agentId, message }) })
};
