import { NextRequest } from "next/server";
import { ok, badRequest, internalError } from "@/lib/http";
import { tickerParamSchema } from "@/lib/validation";
import { researchService } from "@/services/research-service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    const parsed = tickerParamSchema.safeParse({ ticker });

    if (!parsed.success) {
      return badRequest("Invalid ticker");
    }

    const company = await researchService.getCompanySnapshot(parsed.data.ticker);
    return ok({ success: true, data: company });
  } catch (error) {
    return internalError(error instanceof Error ? error.message : "Failed to fetch company snapshot");
  }
}
