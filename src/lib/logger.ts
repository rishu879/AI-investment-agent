import { env } from "@/config/env";

export function logInfo(message: string, meta?: Record<string, unknown>) {
  console.info(JSON.stringify({ level: "info", message, ...meta }));
}

export function logWarning(message: string, meta?: Record<string, unknown>) {
  console.warn(JSON.stringify({ level: "warning", message, ...meta }));
}

export function logError(message: string, meta?: Record<string, unknown>) {
  console.error(JSON.stringify({ level: "error", message, ...meta }));
}

export function logDebug(message: string, meta?: Record<string, unknown>) {
  if (env.NODE_ENV !== "production") {
    console.debug(JSON.stringify({ level: "debug", message, ...meta }));
  }
}
