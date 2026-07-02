import { NextRequest } from "next/server";
import { ok, badRequest, internalError } from "@/lib/http";
import { reportRequestSchema } from "@/lib/validation";
import { researchService } from "@/services/research-service";
import { createRateLimiter, sanitizeBody, rateLimitResponse } from "@/lib/security";

const limiter = createRateLimiter();

export async function POST(request: NextRequest) {
  try {
    const clientKey = request.headers.get("x-forwarded-for") ?? "local";
    if (!limiter.allow(clientKey)) {
      return rateLimitResponse();
    }

    const body = sanitizeBody(await request.json().catch(() => ({})));
    const parsed = reportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid report request", parsed.error.flatten());
    }

    const result = await researchService.buildResearchResult({
      ticker: parsed.data.ticker,
      userId: parsed.data.userId,
    });
    await researchService.saveResearch(result);

    return ok({ success: true, data: result });
  } catch (error) {
    return internalError(error instanceof Error ? error.message : "Failed to create report");
  }
}
