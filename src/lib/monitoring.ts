import { env } from "@/config/env";

export type LogLevel = "info" | "warning" | "error" | "debug";

export function createStructuredLogger(prefix = "app") {
  return {
    info(message: string, meta?: Record<string, unknown>) {
      console.info(JSON.stringify({ level: "info", service: prefix, message, ...meta }));
    },
    warn(message: string, meta?: Record<string, unknown>) {
      console.warn(JSON.stringify({ level: "warning", service: prefix, message, ...meta }));
    },
    error(message: string, meta?: Record<string, unknown>) {
      console.error(JSON.stringify({ level: "error", service: prefix, message, ...meta }));
    },
    debug(message: string, meta?: Record<string, unknown>) {
      if (env.NODE_ENV !== "production") {
        console.debug(JSON.stringify({ level: "debug", service: prefix, message, ...meta }));
      }
    },
  };
}
