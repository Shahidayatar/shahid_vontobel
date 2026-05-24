import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createModelDeploymentController(container: AppContainer) {
  return {
    catalog: async (_req: Request, res: Response) => {
      return res.json(await container.modelDeploymentService.listCatalog());
    },
    listDeployments: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.query.tenantId?.toString();
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }
      return res.json(container.modelDeploymentService.listDeployments(tenantId));
    },
    deploy: async (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId;
      const deploymentName = req.body.deploymentName;
      const modelId = req.body.modelId;

      if (!tenantId || !deploymentName || !modelId) {
        return res.status(400).json({ error: "tenantId, deploymentName, and modelId are required" });
      }

      try {
        const result = await container.modelDeploymentService.deployModel({
          tenantId,
          deploymentName,
          modelId,
          description: req.body.description,
          systemPrompt: req.body.systemPrompt
        });

        return res.status(201).json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Deployment failed";
        return res.status(500).json({ error: message });
      }
    }
  };
}