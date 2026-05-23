export type ProvisioningState = "queued" | "running" | "succeeded" | "failed";

export type ProvisioningStatus = {
  agentId: string;
  tenantId: string;
  state: ProvisioningState;
  currentStep: string;
  messages: string[];
  updatedAt: string;
};
