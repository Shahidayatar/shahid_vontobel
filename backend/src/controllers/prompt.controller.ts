import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createPromptController(container: AppContainer) {
  return {
    createPrompt: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId;
      const agentId = req.body.agentId;
      const systemPrompt = req.body.systemPrompt;
      if (!tenantId || !agentId || !systemPrompt) {
        return res.status(400).json({ error: "tenantId, agentId, and systemPrompt are required" });
      }

      const prompt = container.promptService.createPrompt(agentId, tenantId, systemPrompt, req.auth?.userId ?? "system");
      return res.status(201).json(prompt);
    },
    listPrompts: (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.query.tenantId?.toString();
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      return res.json(container.promptService.listPrompts(String(req.params.agentId), tenantId));
    }
  };
}
