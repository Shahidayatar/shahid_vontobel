import { Router } from "express";
import type { AppContainer } from "../container";
import { createPromptController } from "../controllers/prompt.controller";

export function createPromptRoutes(container: AppContainer) {
  const router = Router();
  const controller = createPromptController(container);

  router.post("/prompts", controller.createPrompt);
  router.get("/prompts/:agentId", controller.listPrompts);

  return router;
}
