import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { requestContextMiddleware } from "./middleware/request-context";
import { registerRoutes } from "./routes";
import { createContainer } from "./container";

export function buildApp() {
  const app = express();
  const container = createContainer();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestContextMiddleware);
  app.use(authMiddleware);
  app.use(morgan("combined"));

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", app: env.APP_NAME, timestamp: new Date().toISOString() });
  });

  registerRoutes(app, container);
  app.use(errorHandler);

  logger.info("Application bootstrapped", { app: env.APP_NAME });

  return app;
}
