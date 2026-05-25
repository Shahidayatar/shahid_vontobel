export type ModelType = "gpt-4o" | "gpt-4.1" | "text-embedding-3-large";

export interface ModelDeployment {
  id: string;
  name: string;
  model: string;
  region: string;
  status: "provisioning" | "running" | "failed";
  health: "healthy" | "degraded" | "offline";
  createdAt: string;
}
