import { Router } from "express";
import type { AppContainer } from "../container";
import { createUsageController } from "../controllers/usage.controller";

export function createUsageRoutes(container: AppContainer) {
  const router = Router();
  const controller = createUsageController(container);

  router.get("/usage/:tenantId", controller.getUsage);

  return router;
}
