import { Router } from "express";
import multer from "multer";
import type { AppContainer } from "../container";
import { createRagController } from "../controllers/rag.controller";

const upload = multer({ storage: multer.memoryStorage() });

export function createRagRoutes(container: AppContainer) {
  const router = Router();
  const controller = createRagController(container);

  router.post("/documents/upload", upload.single("file"), controller.uploadDocument);
  router.post("/documents/:agentId/index", controller.indexDocuments);

  return router;
}
