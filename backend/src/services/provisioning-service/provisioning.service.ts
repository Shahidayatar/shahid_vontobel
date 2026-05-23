import { randomUUID } from "crypto";
import type { AgentResourcePlan } from "../../models/agent";
import type { ProvisioningStatus } from "../../models/provisioning";
import { AgentRepository } from "../../repositories/agent.repository";
import { ProvisioningRepository } from "../../repositories/provisioning.repository";
import { logger } from "../../config/logger";
import { AgentService } from "../agent-service/agent.service";
import type { AzureClients } from "../../azure/azure-clients";

export class ProvisioningService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly provisioningRepository: ProvisioningRepository,
    private readonly azureClients?: AzureClients,
    private readonly agentService?: AgentService
  ) {}

  async provisionAgent(agentId: string, tenantId: string): Promise<ProvisioningStatus> {
    const agent = this.agentRepository.findById(agentId);
    if (!agent || agent.tenantId !== tenantId) {
      throw new Error("Agent not found for tenant");
    }

    const resourcePlan: AgentResourcePlan = {
      openAIDeploymentName: `aoai-${tenantId.slice(0, 8)}-${agentId.slice(0, 8)}`,
      searchIndexName: `idx-${agentId.slice(0, 12)}`,
      storageContainerName: `docs-${agentId.slice(0, 12)}`,
      keyVaultSecretNames: ["aoai-key", "search-key", "storage-connection-string"],
      managedIdentityName: `mi-${agentId.slice(0, 12)}`
    };

    const queued = this.updateStatus(agentId, tenantId, "queued", "Queued for provisioning", ["Resource plan generated"]);
    logger.info("Provisioning queued", { agentId, tenantId, requestId: randomUUID() });

    const running = this.updateStatus(agentId, tenantId, "running", "Creating resources", ["Azure OpenAI deployment", "AI Search index", "Blob container", "Key Vault secret plan", "Managed identity"]);
    await Promise.resolve(running);

    const completed = this.updateStatus(agentId, tenantId, "succeeded", "Provisioning complete", ["Resources planned locally. Replace with Terraform or Azure SDK calls for live deployment."]);
    if (this.azureClients?.search) {
      await this.azureClients.search.ensureIndex(resourcePlan.searchIndexName, 1536);
    }

    if (this.azureClients?.blob) {
      await this.azureClients.blob.ensureContainer(resourcePlan.storageContainerName);
    }

    if (this.azureClients?.keyVault) {
      await this.azureClients.keyVault.setSecret(`${agentId}-resource-plan`, JSON.stringify(resourcePlan));
    }

    if (this.agentService) {
      this.agentService.markProvisioned(agentId, resourcePlan, completed.state);
    }

    return completed;
  }

  getStatus(agentId: string): ProvisioningStatus | undefined {
    return this.provisioningRepository.findByAgentId(agentId);
  }

  private updateStatus(agentId: string, tenantId: string, state: ProvisioningStatus["state"], currentStep: string, messages: string[]): ProvisioningStatus {
    const status: ProvisioningStatus = {
      agentId,
      tenantId,
      state,
      currentStep,
      messages,
      updatedAt: new Date().toISOString()
    };

    this.provisioningRepository.save(status);
    return status;
  }
}
