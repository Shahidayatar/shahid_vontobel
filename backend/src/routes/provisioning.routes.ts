import { Router } from "express";
import type { AppContainer } from "../container";
import { createProvisioningController } from "../controllers/provisioning.controller";

export function createProvisioningRoutes(container: AppContainer) {
  const router = Router();
  const controller = createProvisioningController(container);

  router.post("/provision/:agentId", controller.provision);
  router.get("/provision/status/:agentId", controller.getStatus);

  return router;
}
