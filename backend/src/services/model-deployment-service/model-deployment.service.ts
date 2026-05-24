import { randomUUID } from "crypto";
import type { AgentService } from "../agent-service/agent.service";
import type { ProvisioningService } from "../provisioning-service/provisioning.service";
import { ModelDeploymentRepository } from "../../repositories/model-deployment.repository";
import type { ModelCatalogItem, ModelDeployment } from "../../models/model-deployment";
import type { AzureClients } from "../../azure/azure-clients";

export type DeployModelInput = {
  tenantId: string;
  deploymentName: string;
  modelId: string;
  description?: string;
  systemPrompt?: string;
};

const MODEL_CATALOG: ModelCatalogItem[] = [
  {
    id: "gpt-5-pro",
    displayName: "GPT-5 Pro",
    provider: "Azure OpenAI",
    modelName: "gpt-5-pro",
    description: "Flagship reasoning model for high-value internal copilots.",
    defaultSystemPrompt: "You are a precise enterprise assistant that answers only from approved company knowledge."
  },
  {
    id: "gpt-4o",
    displayName: "GPT-4o",
    provider: "Azure OpenAI",
    modelName: "gpt-4o",
    description: "Balanced model for general-purpose chat and workflow automation.",
    defaultSystemPrompt: "You are a helpful internal assistant that stays grounded in provided company context."
  },
  {
    id: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    provider: "Azure OpenAI",
    modelName: "gpt-4o-mini",
    description: "Lower-cost model for lighter-weight internal assistants.",
    defaultSystemPrompt: "You are a concise internal assistant that answers using the supplied context."
  }
];

const PLATFORM_TENANT_ID = "platform";
const PLATFORM_DEPLOYMENT_NAME = "platform-gpt5-pro";

export class ModelDeploymentService {
  constructor(
    private readonly deploymentRepository: ModelDeploymentRepository,
    private readonly agentService: AgentService,
    private readonly provisioningService: ProvisioningService,
    private readonly azureClients?: AzureClients
  ) {}

  async ensureBaseDeployment() {
    const existing = this.deploymentRepository.listAll().find((deployment) => deployment.tenantId === PLATFORM_TENANT_ID && deployment.modelId === "gpt-5-pro");
    if (existing) {
      return existing;
    }

    const catalog = await this.listCatalog();
    const baseModel = catalog.find((item) => item.id === "gpt-5-pro") ?? MODEL_CATALOG[0];
    const now = new Date().toISOString();
    const baseDeployment = this.deploymentRepository.save({
      id: randomUUID(),
      tenantId: PLATFORM_TENANT_ID,
      agentId: `platform-${baseModel.id}`,
      deploymentName: PLATFORM_DEPLOYMENT_NAME,
      modelId: baseModel.id,
      modelName: baseModel.modelName,
      modelVersion: baseModel.version,
      description: baseModel.description,
      state: "succeeded",
      provisioningMessage: "Platform base deployment available",
      createdAt: now,
      updatedAt: now
    });

    if (this.azureClients?.openAiManagement) {
      const deployments = await this.azureClients.openAiManagement.listDeployments();
      const deployed = deployments.some((deployment) => deployment.name === PLATFORM_DEPLOYMENT_NAME);
      if (!deployed) {
        await this.azureClients.openAiManagement.createDeployment({
          deploymentName: PLATFORM_DEPLOYMENT_NAME,
          modelName: baseModel.modelName,
          modelVersion: baseModel.version,
          capacity: 1
        });
      }
    }

    return baseDeployment;
  }

  async listCatalog(): Promise<ModelCatalogItem[]> {
    if (this.azureClients?.openAiManagement) {
      try {
        const items = await this.azureClients.openAiManagement.listModels();
        if (items.length > 0) {
          return items;
        }
        throw new Error("Azure OpenAI catalog returned no deployable models");
      } catch {
        // If Azure management access exists, do not silently fall back.
        // The UI should surface the real auth or catalog problem.
        throw new Error("Failed to load Azure OpenAI model catalog");
      }
    }

    return MODEL_CATALOG;
  }

  listDeployments(tenantId: string): ModelDeployment[] {
    return this.deploymentRepository
      .listAll()
      .filter((deployment) => deployment.tenantId === tenantId || deployment.tenantId === PLATFORM_TENANT_ID)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async deployModel(input: DeployModelInput) {
    const catalog = await this.listCatalog();
    const catalogItem = catalog.find((item) => item.id === input.modelId);
    if (!catalogItem) {
      throw new Error(`Unknown model: ${input.modelId}`);
    }

    const now = new Date().toISOString();
    const agent = this.agentService.createAgent({
      tenantId: input.tenantId,
      name: input.deploymentName,
      description: input.description ?? catalogItem.description,
      model: catalogItem.modelName,
      systemPrompt: input.systemPrompt ?? catalogItem.defaultSystemPrompt,
      dataSources: []
    });

    this.agentService.assignResourcePlan(agent.id, agent.tenantId, {
      openAIDeploymentName: input.deploymentName,
      searchIndexName: `idx-${agent.id.slice(0, 12)}`,
      storageContainerName: `docs-${agent.id.slice(0, 12)}`,
      keyVaultSecretNames: ["aoai-key", "search-key", "storage-connection-string"],
      managedIdentityName: `mi-${agent.id.slice(0, 12)}`
    });

    const queued = this.deploymentRepository.save({
      id: randomUUID(),
      tenantId: input.tenantId,
      agentId: agent.id,
      deploymentName: input.deploymentName,
      modelId: catalogItem.id,
      modelName: catalogItem.modelName,
      modelVersion: catalogItem.version,
      description: input.description ?? catalogItem.description,
      state: "queued",
      provisioningMessage: "Queued for deployment",
      createdAt: now,
      updatedAt: now
    });

    void this.runDeployment(queued, agent.id, input.tenantId, catalogItem);

    return { deployment: queued, agent, catalogItem };
  }

  async deleteDeployment(tenantId: string, deploymentId: string) {
    const deployment = this.deploymentRepository.findById(deploymentId);
    if (!deployment || (deployment.tenantId !== tenantId && deployment.tenantId !== PLATFORM_TENANT_ID)) {
      return false;
    }

    if (deployment.tenantId === PLATFORM_TENANT_ID) {
      throw new Error("The platform base deployment cannot be deleted");
    }

    if (this.azureClients?.openAiManagement) {
      await this.azureClients.openAiManagement.deleteDeployment(deployment.deploymentName);
    }

    this.agentService.deleteAgent(deployment.tenantId, deployment.agentId);
    return this.deploymentRepository.delete(deploymentId);
  }

  private async runDeployment(deployment: ModelDeployment, agentId: string, tenantId: string, catalogItem: ModelCatalogItem) {
    this.deploymentRepository.save({
      ...deployment,
      state: "running",
      provisioningMessage: "Creating Azure OpenAI deployment",
      updatedAt: new Date().toISOString()
    });

    try {
      const status = await this.provisioningService.provisionAgent(agentId, tenantId, {
        deploymentName: deployment.deploymentName,
        modelName: catalogItem.modelName,
        modelVersion: catalogItem.version
      });

      this.deploymentRepository.save({
        ...deployment,
        state: status.state,
        provisioningMessage: status.currentStep,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      this.deploymentRepository.save({
        ...deployment,
        state: "failed",
        provisioningMessage: error instanceof Error ? error.message : "Deployment failed",
        updatedAt: new Date().toISOString()
      });
    }
  }
}