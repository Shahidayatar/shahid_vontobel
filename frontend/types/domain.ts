export type DeploymentHealth = "healthy" | "degraded" | "offline";

export type ModelType = "gpt-4o" | "gpt-4.1" | "text-embedding-3-large";

export interface ModelDeployment {
  id: string;
  name: string;
  model: ModelType;
  region: string;
  status: "provisioning" | "running" | "failed";
  health: DeploymentHealth;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  modelDeploymentId: string;
  systemPrompt: string;
  temperature: number;
  retrievalEnabled: boolean;
  createdAt: string;
  status: "active" | "paused";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  citations?: Array<{ title: string; source: string }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
  };
}

export interface DashboardOverview {
  totalModels: number;
  activeAgents: number;
  tokenUsage: number;
  monthlyCost: number;
  recentDeployments: ModelDeployment[];
  recentChats: Array<{ id: string; title: string; target: string; createdAt: string }>;
  health: {
    healthy: number;
    degraded: number;
    offline: number;
  };
}