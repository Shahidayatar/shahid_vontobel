import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createChatController(container: AppContainer) {
  return {
    chat: async (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId;
      const agentId = req.body.agentId;
      const question = req.body.question;

      if (!tenantId || !agentId || !question) {
        return res.status(400).json({ error: "tenantId, agentId, and question are required" });
      }

      const result = await container.chatService.chat({ tenantId, agentId, question });
      return res.json(result);
    }
  };
}
