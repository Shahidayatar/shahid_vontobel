import { Router } from "express";
import type { AppContainer } from "../container";
import { createChatController } from "../controllers/chat.controller";

export function createChatRoutes(container: AppContainer) {
  const router = Router();
  const controller = createChatController(container);

  router.post("/chat", controller.chat);

  return router;
}
