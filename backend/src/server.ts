import { env } from "./config/env";
import { logger } from "./config/logger";
import { buildApp } from "./app";

const app = buildApp();

app.listen(env.PORT, () => {
  logger.info("Backend server started", { port: env.PORT });
});
