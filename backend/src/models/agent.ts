export type Agent = {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  model: string;
  systemPrompt: string;
  dataSources: string[];
  isProvisioned: boolean;
  provisioningStatus?: string;
  resourcePlan?: AgentResourcePlan;
  createdAt: string;
  updatedAt: string;
};

export type AgentResourcePlan = {
  openAIDeploymentName: string;
  searchIndexName: string;
  storageContainerName: string;
  keyVaultSecretNames: string[];
  managedIdentityName: string;
};
