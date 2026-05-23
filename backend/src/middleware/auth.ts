import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { AuthContext } from "../models/auth";

function buildDevAuth(req: Request): AuthContext {
  const tenantId = req.header("x-tenant-id") ?? "tenant-dev";
  const userId = req.header("x-user-id") ?? "user-dev";
  const roles = (req.header("x-user-roles") ?? "PlatformAdmin").split(",").map((role) => role.trim()).filter(Boolean);

  return {
    tenantId,
    userId,
    roles
  };
}

async function verifyBearerToken(token: string): Promise<AuthContext> {
  const jwksUri = env.AZURE_AD_JWKS_URI;
  const issuer = env.AZURE_AD_ISSUER;
  const audience = env.AZURE_AD_CLIENT_ID;

  if (!jwksUri || !issuer || !audience) {
    throw new Error("Azure Entra configuration is incomplete");
  }

  const jwks = createRemoteJWKSet(new URL(jwksUri));
  const result = await jwtVerify(token, jwks, { issuer, audience });
  const payload = result.payload;
  const tenantId = typeof payload.tid === "string" ? payload.tid : "unknown-tenant";
  const userId = typeof payload.oid === "string" ? payload.oid : typeof payload.sub === "string" ? payload.sub : "unknown-user";
  const roles = Array.isArray(payload.roles)
    ? payload.roles.filter((role): role is string => typeof role === "string")
    : [];

  return {
    tenantId,
    userId,
    roles,
    issuer: typeof payload.iss === "string" ? payload.iss : undefined,
    tokenSubject: typeof payload.sub === "string" ? payload.sub : undefined
  };
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (env.AUTH_DISABLED) {
    req.auth = buildDevAuth(req);
    return next();
  }

  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing bearer token" });
  }

  try {
    req.auth = await verifyBearerToken(authorization.slice(7));
    return next();
  } catch (error) {
    logger.warn("Authentication failed", {
      requestId: req.requestId,
      error: error instanceof Error ? error.message : String(error)
    });

    return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
  }
}
