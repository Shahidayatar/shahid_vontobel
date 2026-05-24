import type { Express } from "express";
import type { AppContainer } from "../container";
import { createAgentRoutes } from "./agent.routes";
import { createChatRoutes } from "./chat.routes";
import { createEvaluationRoutes } from "./evaluation.routes";
import { createPromptRoutes } from "./prompt.routes";
import { createModelDeploymentRoutes } from "./model-deployment.routes";
import { createProvisioningRoutes } from "./provisioning.routes";
import { createRagRoutes } from "./rag.routes";
import { createUsageRoutes } from "./usage.routes";

export function registerRoutes(app: Express, container: AppContainer) {
  app.use(createAgentRoutes(container));
  app.use(createRagRoutes(container));
  app.use(createChatRoutes(container));
  app.use(createPromptRoutes(container));
  app.use(createModelDeploymentRoutes(container));
  app.use(createProvisioningRoutes(container));
  app.use(createEvaluationRoutes(container));
  app.use(createUsageRoutes(container));
}
