import { NextRequest } from "next/server";
import { ok, badRequest, internalError } from "@/lib/http";
import { idParamSchema } from "@/lib/validation";
import { historyService } from "@/services/history-service";
import { createRateLimiter, rateLimitResponse } from "@/lib/security";

const limiter = createRateLimiter();

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clientKey = request.headers.get("x-forwarded-for") ?? "local";
    if (!limiter.allow(clientKey)) {
      return rateLimitResponse();
    }

    const { id } = await params;
    const parsed = idParamSchema.safeParse({ id });

    if (!parsed.success) {
      return badRequest("Invalid history id");
    }

    await historyService.remove(parsed.data.id);
    return ok({ success: true, data: { id: parsed.data.id, deleted: true } });
  } catch (error) {
    return internalError(error instanceof Error ? error.message : "Failed to delete history entry");
  }
}
