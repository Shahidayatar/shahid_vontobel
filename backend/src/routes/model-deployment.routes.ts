import { Router } from "express";
import type { AppContainer } from "../container";
import { createModelDeploymentController } from "../controllers/model-deployment.controller";

export function createModelDeploymentRoutes(container: AppContainer) {
  const router = Router();
  const controller = createModelDeploymentController(container);

  router.get("/models/catalog", controller.catalog);
  router.get("/model-deployments", controller.listDeployments);
  router.post("/model-deployments", controller.deploy);

  return router;
}