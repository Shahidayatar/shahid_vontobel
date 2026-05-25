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
