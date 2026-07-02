import { NextRequest } from "next/server";
import { ok, badRequest, internalError } from "@/lib/http";
import { historyEntrySchema, historyQuerySchema } from "@/lib/validation";
import { historyService } from "@/services/history-service";
import { createRateLimiter, sanitizeBody, rateLimitResponse } from "@/lib/security";
import { parseBearerToken, verifyJwt } from "@/lib/auth";

const limiter = createRateLimiter();

function getUserIdFromRequest(request: NextRequest) {
  const token = parseBearerToken(request.headers);
  if (!token) return null;
  const payload = verifyJwt(token);
  return payload?.sub?.toString() ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const clientKey = request.headers.get("x-forwarded-for") ?? "local";
    if (!limiter.allow(clientKey)) {
      return rateLimitResponse();
    }

    const { search, page, pageSize } = historyQuerySchema.parse({
      search: request.nextUrl.searchParams.get("search") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
    });
    const userId = getUserIdFromRequest(request);

    const { entries, total } = await historyService.list({ search, page, pageSize, userId: userId ?? undefined });

    return ok({ success: true, data: entries, meta: { total, page, pageSize } });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return badRequest("Invalid query parameters", (error as unknown as { flatten: () => unknown }).flatten());
    }
    return internalError(error instanceof Error ? error.message : "Failed to fetch history");
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientKey = request.headers.get("x-forwarded-for") ?? "local";
    if (!limiter.allow(clientKey)) {
      return rateLimitResponse();
    }

    const body = sanitizeBody(await request.json().catch(() => ({})));
    const parsed = historyEntrySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid history payload", parsed.error.flatten());
    }

    const userId = getUserIdFromRequest(request);
    const entry = await historyService.create({
      ...parsed.data,
      userId: userId ?? undefined,
    });

    return ok({ success: true, data: entry });
  } catch (error) {
    return internalError(error instanceof Error ? error.message : "Failed to create history entry");
  }
}
