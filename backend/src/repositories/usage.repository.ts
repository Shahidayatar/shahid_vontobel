import type { UsageRecord } from "../models/usage";

export class UsageRepository {
  private readonly records = new Map<string, UsageRecord>();

  save(record: UsageRecord): UsageRecord {
    this.records.set(record.id, record);
    return record;
  }

  listByTenant(tenantId: string): UsageRecord[] {
    return Array.from(this.records.values()).filter((record) => record.tenantId === tenantId);
  }

  listByAgent(agentId: string): UsageRecord[] {
    return Array.from(this.records.values()).filter((record) => record.agentId === agentId);
  }
}
