import { NextRequest } from "next/server";
import { aiPredictionService } from "@/services/ai-prediction-service";
import { badRequest, internalError, ok } from "@/lib/http";
import { tickerParamSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const parsed = tickerParamSchema.safeParse({ ticker });

    if (!parsed.success) {
      return badRequest("Invalid stock ticker parameter");
    }

    const prediction = await aiPredictionService.predictStock(parsed.data.ticker);
    return ok({ success: true, data: prediction });
  } catch (error) {
    return internalError(
      error instanceof Error ? error.message : "Failed to calculate technical predictions"
    );
  }
}
