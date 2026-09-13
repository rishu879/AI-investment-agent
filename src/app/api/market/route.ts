import { NextResponse } from "next/server";
import { marketService } from "@/services/market-service";
import { internalError, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await marketService.getMarketOverview();
    return ok({ success: true, data });
  } catch (error) {
    return internalError(error instanceof Error ? error.message : "Failed to fetch market overview");
  }
}
