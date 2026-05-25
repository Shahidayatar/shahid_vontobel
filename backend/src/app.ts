import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { agentChatRouter } from "./modules/agent-chat-service/agent-chat.controller";
import { agentRouter } from "./modules/agent-service/agent.controller";
import { dashboardService } from "./modules/dashboard.service";
import { modelChatRouter } from "./modules/model-chat-service/model-chat.controller";
import { modelRouter } from "./modules/model-service/model.controller";
import { errorHandler } from "./shared/middleware/error-handler";

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.ALLOWED_ORIGIN === "*" ? true : env.ALLOWED_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("tiny"));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/dashboard/overview", (_request, response) => {
    response.json(dashboardService.overview());
  });

  app.use("/api/models", modelRouter);
  app.use("/api/model-chat", modelChatRouter);
  app.use("/api/agents", agentRouter);
  app.use("/api/agent-chat", agentChatRouter);

  app.use(errorHandler);
  return app;
}
