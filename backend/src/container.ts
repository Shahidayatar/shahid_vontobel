import { AgentRepository } from "./repositories/agent.repository";
import { DocumentRepository } from "./repositories/document.repository";
import { PromptRepository } from "./repositories/prompt.repository";
import { ModelDeploymentRepository } from "./repositories/model-deployment.repository";
import { ProvisioningRepository } from "./repositories/provisioning.repository";
import { UsageRepository } from "./repositories/usage.repository";
import { createAzureClients } from "./azure/azure-clients";
import { AgentService } from "./services/agent-service/agent.service";
import { ChatService } from "./services/chat-service/chat.service";
import { EvaluationService } from "./services/evaluation-service/evaluation.service";
import { ModelDeploymentService } from "./services/model-deployment-service/model-deployment.service";
import { ProvisioningService } from "./services/provisioning-service/provisioning.service";
import { PromptService } from "./services/prompt-service/prompt.service";
import { RagService } from "./services/rag-service/rag.service";
import { UsageService } from "./services/usage-service/usage.service";
import { logger } from "./config/logger";

export function createContainer() {
  const azureClients = createAzureClients();
  const agentRepository = new AgentRepository();
  const documentRepository = new DocumentRepository();
  const promptRepository = new PromptRepository();
  const modelDeploymentRepository = new ModelDeploymentRepository();
  const usageRepository = new UsageRepository();
  const provisioningRepository = new ProvisioningRepository();

  const agentService = new AgentService(agentRepository, promptRepository);
  const provisioningService = new ProvisioningService(agentRepository, provisioningRepository, azureClients, agentService);
  const ragService = new RagService(agentRepository, documentRepository, usageRepository, azureClients);
  const chatService = new ChatService(agentRepository, documentRepository, promptRepository, usageRepository, azureClients);
  const promptService = new PromptService(agentRepository, promptRepository);
  const modelDeploymentService = new ModelDeploymentService(modelDeploymentRepository, agentService, provisioningService, azureClients);
  const evaluationService = new EvaluationService();
  const usageService = new UsageService(usageRepository);

  void modelDeploymentService.ensureBaseDeployment().catch((error) => {
    logger.warn("Base deployment seed failed", {
      error: error instanceof Error ? error.message : String(error)
    });
  });

  return {
    agentRepository,
    documentRepository,
    promptRepository,
    modelDeploymentRepository,
    usageRepository,
    provisioningRepository,
    azureClients,
    agentService,
    provisioningService,
    ragService,
    chatService,
    promptService,
    modelDeploymentService,
    evaluationService,
    usageService
  };
}

export type AppContainer = ReturnType<typeof createContainer>;
