import YahooFinance from "yahoo-finance2";
import { BaseTool, ToolResult } from "@/tools/base";
import type { FinancialMetrics } from "@/types/research";
import { logError } from "@/lib/logger";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export class YahooFinanceFinancialTool extends BaseTool<{ ticker: string }, FinancialMetrics> {
  name = "YahooFinanceFinancialTool";

  async execute({ ticker }: { ticker: string }): Promise<ToolResult<FinancialMetrics>> {
    if (!ticker) {
      return { ok: false, error: "Ticker is required" };
    }

    try {
      const quote = await yahooFinance.quote(ticker.toUpperCase());
      return {
        ok: true,
        data: {
          peRatio: quote.trailingPE ?? null,
          marketCap: quote.marketCap ?? null,
          revenueGrowth: null,
          eps: quote.epsTrailingTwelveMonths ?? null,
          debtToEquity: null,
          grossMargin: null,
          operatingMargin: null,
          freeCashFlow: null,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yahoo Finance fetch failed";
      logError("Yahoo Finance financial tool failed", { ticker, error: message });
      return { ok: false, error: message };
    }
  }
}
