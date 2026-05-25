import { env } from "./config/env";
import { createApp } from "./app";
import { logger } from "./shared/logging/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info("Backend started", { port: env.PORT, env: env.NODE_ENV });
});
