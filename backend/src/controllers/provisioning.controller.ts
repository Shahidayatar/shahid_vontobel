import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createProvisioningController(container: AppContainer) {
  return {
    provision: async (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId;
      const agentId = String(req.params.agentId);
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      const status = await container.provisioningService.provisionAgent(agentId, tenantId);
      return res.status(202).json(status);
    },
    getStatus: (req: Request, res: Response) => {
      const status = container.provisioningService.getStatus(String(req.params.agentId));
      if (!status) {
        return res.status(404).json({ error: "Provisioning status not found" });
      }

      return res.json(status);
    }
  };
}
