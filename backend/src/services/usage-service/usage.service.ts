import { UsageRepository } from "../../repositories/usage.repository";

export class UsageService {
  constructor(private readonly usageRepository: UsageRepository) {}

  getUsageByTenant(tenantId: string) {
    const records = this.usageRepository.listByTenant(tenantId);
    const totalInputTokens = records.reduce((sum, record) => sum + record.inputTokens, 0);
    const totalOutputTokens = records.reduce((sum, record) => sum + record.outputTokens, 0);
    const totalCostUsd = Number(records.reduce((sum, record) => sum + record.estimatedCostUsd, 0).toFixed(6));

    return {
      tenantId,
      requestCount: records.length,
      totalInputTokens,
      totalOutputTokens,
      totalCostUsd,
      records
    };
  }
}
