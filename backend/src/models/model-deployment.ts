export type ModelCatalogItem = {
  id: string;
  displayName: string;
  provider: string;
  modelName: string;
  version?: string;
  description: string;
  defaultSystemPrompt: string;
};

export type ModelDeploymentState = "queued" | "running" | "succeeded" | "failed";

export type ModelDeployment = {
  id: string;
  tenantId: string;
  agentId: string;
  deploymentName: string;
  modelId: string;
  modelName: string;
  modelVersion?: string;
  description: string;
  state: ModelDeploymentState;
  provisioningMessage: string;
  createdAt: string;
  updatedAt: string;
};