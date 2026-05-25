type LogLevel = "INFO" | "WARN" | "ERROR";

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ?? {})
  };
  const serialized = JSON.stringify(payload);
  if (level === "ERROR") {
    console.error(serialized);
    return;
  }
  console.log(serialized);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => write("INFO", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("WARN", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("ERROR", message, context)
};
