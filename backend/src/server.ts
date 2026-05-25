import { env } from "./config/env";
import { createApp } from "./app";
import { logger } from "./shared/logging/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info("Backend started", {
    port: env.PORT,
    env: env.NODE_ENV,
    azureOpenAiEndpointConfigured: Boolean(env.AZURE_OPENAI_ENDPOINT),
    azureOpenAiKeyConfigured: Boolean(env.AZURE_OPENAI_KEY),
    azureOpenAiChatFallback: !(env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_KEY)
  });
});
