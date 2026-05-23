import type { ProvisioningStatus } from "../models/provisioning";

export class ProvisioningRepository {
  private readonly statuses = new Map<string, ProvisioningStatus>();

  save(status: ProvisioningStatus): ProvisioningStatus {
    this.statuses.set(status.agentId, status);
    return status;
  }

  findByAgentId(agentId: string): ProvisioningStatus | undefined {
    return this.statuses.get(agentId);
  }
}
