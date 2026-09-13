import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { DEFAULT_TRADABLE_ASSETS, type TradableAsset } from "@/services/trading-simulator-service";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET() {
  const assets: TradableAsset[] = [];

  for (const item of DEFAULT_TRADABLE_ASSETS) {
    try {
      const quote = await yf.quote(item.symbol);
      const price = Number(quote.regularMarketPrice ?? item.price);
      const change = Number(quote.regularMarketChange ?? item.change);
      const changePercent = Number(quote.regularMarketChangePercent ?? item.changePercent);

      assets.push({
        ...item,
        price: Number(price.toFixed(price > 10 ? 2 : 4)),
        change: Number(change.toFixed(price > 10 ? 2 : 4)),
        changePercent: Number(changePercent.toFixed(2)),
      });
    } catch (err) {
      logError("Failed to fetch live practice quote for symbol", { symbol: item.symbol, err });
      // Fallback to initial base price with a tiny simulated jitter for lively experience
      const jitter = (Math.random() - 0.5) * 0.004;
      const simPrice = item.price * (1 + jitter);
      assets.push({
        ...item,
        price: Number(simPrice.toFixed(item.price > 10 ? 2 : 4)),
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: assets,
    timestamp: new Date().toISOString(),
  });
}
