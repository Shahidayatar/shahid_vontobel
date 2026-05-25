import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";
import { logger } from "../logging/logger";

export function errorHandler(error: unknown, request: Request, response: Response, _next: NextFunction): void {
  logger.error("Request failed", {
    path: request.path,
    method: request.method,
    error: error instanceof Error ? error.message : "Unknown error"
  });

  if (error instanceof ZodError) {
    response.status(400).json({ message: "Validation error", issues: error.issues });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  response.status(500).json({ message: "Internal server error" });
}
