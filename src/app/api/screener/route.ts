import { NextRequest } from "next/server";
import { screenerService, type ScreenerFilters } from "@/services/screener-service";
import { internalError, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || undefined;
    const sector = searchParams.get("sector") || undefined;
    const minPe = searchParams.get("minPe") ? Number(searchParams.get("minPe")) : undefined;
    const maxPe = searchParams.get("maxPe") ? Number(searchParams.get("maxPe")) : undefined;
    const minMarketCap = searchParams.get("minMarketCap") ? Number(searchParams.get("minMarketCap")) : undefined;
    const minDividendYield = searchParams.get("minDividendYield") ? Number(searchParams.get("minDividendYield")) : undefined;
    const maxDebtToEquity = searchParams.get("maxDebtToEquity") ? Number(searchParams.get("maxDebtToEquity")) : undefined;
    const preset = (searchParams.get("preset") as ScreenerFilters["preset"]) || "all";

    const stocks = await screenerService.screenStocks({
      search,
      sector,
      minPe,
      maxPe,
      minMarketCap,
      minDividendYield,
      maxDebtToEquity,
      preset,
    });

    return ok({ success: true, data: stocks, count: stocks.length });
  } catch (error) {
    return internalError(error instanceof Error ? error.message : "Failed to execute stock screener");
  }
}
