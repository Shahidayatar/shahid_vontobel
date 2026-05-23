export type UsageRecord = {
  id: string;
  requestId: string;
  tenantId: string;
  agentId: string;
  operation: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  createdAt: string;
};
