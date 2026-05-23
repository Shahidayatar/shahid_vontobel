import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createUsageController(container: AppContainer) {
  return {
    getUsage: (req: Request, res: Response) => {
      const tenantId = String(req.params.tenantId);
      return res.json(container.usageService.getUsageByTenant(tenantId));
    }
  };
}
