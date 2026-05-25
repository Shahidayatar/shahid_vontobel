import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../../config/env";

async function verifyEntraToken(token: string): Promise<boolean> {
  if (!env.ENTRA_TENANT_ID || !env.ENTRA_AUDIENCE) {
    return true;
  }

  const jwks = createRemoteJWKSet(
    new URL(`https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/discovery/v2.0/keys`)
  );
  await jwtVerify(token, jwks, {
    issuer: `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/v2.0`,
    audience: env.ENTRA_AUDIENCE
  });
  return true;
}

export async function authMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
  const authHeader = request.header("authorization");
  if (!authHeader) {
    response.status(401).json({ message: "Missing authorization header" });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    await verifyEntraToken(token);
    next();
  } catch {
    response.status(401).json({ message: "Invalid access token" });
  }
}
