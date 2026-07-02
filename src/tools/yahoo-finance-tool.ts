import YahooFinance from "yahoo-finance2";
import { BaseTool, ToolResult } from "@/tools/base";
import type { CompanySnapshot } from "@/types/research";
import { logError } from "@/lib/logger";

interface YahooSummaryProfile {
  sector?: string;
  industry?: string;
  longBusinessSummary?: string;
}

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export class YahooFinanceTool extends BaseTool<{ ticker: string }, CompanySnapshot> {
  name = "YahooFinanceTool";

  async execute({ ticker }: { ticker: string }): Promise<ToolResult<CompanySnapshot>> {
    if (!ticker) {
      return { ok: false, error: "Ticker is required" };
    }

    try {
      const quote = await yahooFinance.quote(ticker.toUpperCase());
      const summary = await yahooFinance.quoteSummary(ticker.toUpperCase());
      const summaryProfile = (summary?.summaryProfile as YahooSummaryProfile | undefined) ?? {};

      return {
        ok: true,
        data: {
          ticker: String(quote.symbol ?? ticker).toUpperCase(),
          name: String(quote.longName ?? quote.shortName ?? ticker).trim(),
          sector: String(summaryProfile.sector ?? quote.sector ?? "Unknown"),
          industry: String(summaryProfile.industry ?? quote.industry ?? "Unknown"),
          marketCap: quote.marketCap ? `$${(quote.marketCap / 1e9).toFixed(1)}B` : "N/A",
          currentPrice: Number(quote.regularMarketPrice ?? 0),
          currency: String(quote.currency ?? "USD"),
          exchange: String(quote.fullExchangeName ?? quote.exchange ?? "Unknown"),
          description: String(summaryProfile.longBusinessSummary ?? quote.longBusinessSummary ?? ""),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yahoo Finance fetch failed";
      logError("Yahoo Finance tool failed", { ticker, error: message });
      return { ok: false, error: message };
    }
  }
}
