import type { Request, Response } from "express";
import type { AppContainer } from "../container";
import { logger } from "../config/logger";

export function createModelDeploymentController(container: AppContainer) {
  return {
    catalog: async (_req: Request, res: Response) => {
      try {
        return res.json(await container.modelDeploymentService.listCatalog());
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load model catalog";
        logger.error("Failed to load model catalog", {
          error: message,
          stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({ error: message });
      }
    },
    listDeployments: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.query.tenantId?.toString();
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      return res.json([]);
    },
    deploy: async (req: Request, res: Response) => {
      return res.status(410).json({ error: "Model deployments are centrally managed by the platform admin" });
    },
    deleteDeployment: async (req: Request, res: Response) => {
      return res.status(410).json({ error: "Model deployments are centrally managed by the platform admin" });
    }
  };
}