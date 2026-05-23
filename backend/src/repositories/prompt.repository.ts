import type { PromptVersion } from "../models/prompt";

export class PromptRepository {
  private readonly versions = new Map<string, PromptVersion>();

  save(version: PromptVersion): PromptVersion {
    this.versions.set(version.id, version);
    return version;
  }

  listByAgent(agentId: string, tenantId: string): PromptVersion[] {
    return Array.from(this.versions.values())
      .filter((version) => version.agentId === agentId && version.tenantId === tenantId)
      .sort((left, right) => right.version - left.version);
  }

  findActiveByAgent(agentId: string, tenantId: string): PromptVersion | undefined {
    return this.listByAgent(agentId, tenantId).find((version) => version.isActive);
  }

  deactivateExisting(agentId: string, tenantId: string): void {
    for (const [id, version] of this.versions.entries()) {
      if (version.agentId === agentId && version.tenantId === tenantId) {
        this.versions.set(id, { ...version, isActive: false });
      }
    }
  }
}
