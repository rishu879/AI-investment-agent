import { NextResponse } from "next/server";

const limiters = new Map<string, { count: number; resetAt: number }>();

export const RATE_LIMIT_LIMIT = 30;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export function createRateLimiter(limit = RATE_LIMIT_LIMIT, windowMs = RATE_LIMIT_WINDOW_MS) {
  return {
    allow(key: string) {
      const now = Date.now();
      const existing = limiters.get(key);

      if (!existing || existing.resetAt <= now) {
        limiters.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (existing.count >= limit) {
        return false;
      }

      existing.count += 1;
      return true;
    },
  };
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim();
}

export function sanitizeBody<T extends Record<string, unknown>>(body: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item));
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeBody(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export function rateLimitResponse() {
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again shortly." },
    { status: 429 }
  );
}
