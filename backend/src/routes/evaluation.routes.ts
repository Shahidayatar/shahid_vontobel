import { Router } from "express";
import type { AppContainer } from "../container";
import { createEvaluationController } from "../controllers/evaluation.controller";

export function createEvaluationRoutes(container: AppContainer) {
  const router = Router();
  const controller = createEvaluationController(container);

  router.post("/evaluate", controller.evaluate);

  return router;
}
