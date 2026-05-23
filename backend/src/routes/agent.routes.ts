import { Router } from "express";
import type { AppContainer } from "../container";
import { createAgentController } from "../controllers/agent.controller";

export function createAgentRoutes(container: AppContainer) {
  const router = Router();
  const controller = createAgentController(container);

  router.post("/agents", controller.createAgent);
  router.get("/agents", controller.listAgents);
  router.get("/agents/:id", controller.getAgent);

  return router;
}
