import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createAgentController(container: AppContainer) {
  return {
    createAgent: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId;
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      const agent = container.agentService.createAgent({
        tenantId,
        name: req.body.name,
        description: req.body.description,
        model: req.body.model ?? "gpt-4o",
        systemPrompt: req.body.systemPrompt,
        dataSources: req.body.dataSources ?? []
      });

      return res.status(201).json(agent);
    },
    listAgents: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.query.tenantId?.toString();
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      return res.json(container.agentService.listAgents(tenantId));
    },
    getAgent: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.query.tenantId?.toString();
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      const agent = container.agentService.getAgent(tenantId, String(req.params.id));
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      return res.json(agent);
    }
  };
}
