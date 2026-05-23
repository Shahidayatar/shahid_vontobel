import type { Request, Response } from "express";
import type { AppContainer } from "../container";

export function createRagController(container: AppContainer) {
  return {
    uploadDocument: async (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId;
      const agentId = req.body.agentId;
      if (!tenantId || !agentId) {
        return res.status(400).json({ error: "tenantId and agentId are required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "A file upload is required" });
      }

      const document = await container.ragService.uploadDocument({
        tenantId,
        agentId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        content: req.file.buffer
      });

      return res.status(201).json(document);
    },
    indexDocuments: async (req: Request, res: Response) => {
      const tenantId = req.auth?.tenantId ?? req.body.tenantId ?? req.query.tenantId?.toString();
      const agentId = String(req.params.agentId);
      if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" });
      }

      const indexedChunks = await container.ragService.indexDocuments(agentId, tenantId);
      return res.json({ agentId, tenantId, indexedCount: indexedChunks.length, chunks: indexedChunks });
    }
  };
}
