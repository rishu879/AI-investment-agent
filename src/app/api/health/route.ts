import { ok, internalError } from "@/lib/http";
import { prisma } from "@/database/prisma";
import { env } from "@/config/env";
import { logError } from "@/lib/logger";
import { createRateLimiter, rateLimitResponse } from "@/lib/security";

const limiter = createRateLimiter();

export async function GET(request: Request) {
  try {
    const clientKey = request.headers.get("x-forwarded-for") ?? "local";
    if (!limiter.allow(clientKey)) {
      return rateLimitResponse();
    }
    const statuses = [] as Array<{ service: string; healthy: boolean; message: string }>;

    try {
      await prisma.$queryRaw`SELECT 1`;
      statuses.push({ service: "Database", healthy: true, message: "Connected to the primary database." });
    } catch (error) {
      statuses.push({ service: "Database", healthy: false, message: "Unable to connect to the database." });
      logError("health check failed: database unavailable", { error });
    }

    statuses.push({
      service: "Gemini",
      healthy: Boolean(env.GEMINI_API_KEY),
      message: env.GEMINI_API_KEY
        ? "Gemini API key is configured. AI analysis is enabled."
        : "Gemini API key is missing. AI research will fail until configured.",
    });

    statuses.push({
      service: "Yahoo Finance",
      healthy: Boolean(env.YAHOO_FINANCE_BASE_URL),
      message: env.YAHOO_FINANCE_BASE_URL
        ? "Yahoo Finance endpoint is configured for company data."
        : "Yahoo Finance endpoint is unavailable.",
    });

    statuses.push({
      service: "News",
      healthy: true,
      message: "Google News RSS is available for company news lookups.",
    });

    statuses.push({
      service: "LangGraph",
      healthy: Boolean(env.GEMINI_API_KEY),
      message: env.GEMINI_API_KEY
        ? "LangGraph workflow is ready for execution."
        : "LangGraph workflow is limited until Gemini is configured.",
    });

    return ok({ success: true, data: statuses });
  } catch (error) {
    logError("health route failed", { error });
    return internalError(error instanceof Error ? error.message : "Failed to evaluate health status");
  }
}
