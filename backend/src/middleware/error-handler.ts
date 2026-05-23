import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const message = error instanceof Error ? error.message : "Unexpected error";

  logger.error("Request failed", {
    requestId: req.requestId,
    error: message
  });

  res.status(500).json({
    error: "InternalServerError",
    message,
    requestId: req.requestId
  });
}
