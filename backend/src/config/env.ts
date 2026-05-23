import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  AUTH_DISABLED: z.coerce.boolean().default(true),
  AZURE_USE_MANAGED_IDENTITY: z.coerce.boolean().default(true),
  AZURE_AD_TENANT_ID: z.string().optional(),
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_AD_ISSUER: z.string().optional(),
  AZURE_AD_JWKS_URI: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_CHAT_DEPLOYMENT: z.string().optional(),
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT: z.string().optional(),
  AZURE_SEARCH_ENDPOINT: z.string().optional(),
  AZURE_SEARCH_INDEX_PREFIX: z.string().default("aifoundry"),
  AZURE_BLOB_SERVICE_URL: z.string().optional(),
  AZURE_BLOB_CONTAINER_PREFIX: z.string().default("agentdocs"),
  AZURE_KEY_VAULT_URL: z.string().optional(),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(1536),
  APP_NAME: z.string().default("ai-foundry-as-a-service")
});

export const env = envSchema.parse(process.env);
