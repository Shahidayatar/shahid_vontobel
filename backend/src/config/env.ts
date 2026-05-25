import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  ALLOWED_ORIGIN: z.string().default("*"),
  ENTRA_TENANT_ID: z.string().optional(),
  ENTRA_AUDIENCE: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_API_VERSION: z.string().default("2024-10-21"),
  AZURE_OPENAI_KEY: z.string().optional(),
  AZURE_SEARCH_ENDPOINT: z.string().optional(),
  AZURE_SEARCH_INDEX: z.string().optional(),
  AZURE_SEARCH_KEY: z.string().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

export const env = parsed.data;
