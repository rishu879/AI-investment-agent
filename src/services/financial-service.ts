import type { FinancialMetrics } from "@/types/research";
import { YahooFinanceFinancialTool } from "@/tools/yahoo-finance-financial-tool";
import { logError, logInfo } from "@/lib/logger";

const financialTool = new YahooFinanceFinancialTool();

export class FinancialService {
  async getFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
    const result = await financialTool.execute({ ticker });

    if (!result.ok || !result.data) {
      logError("FinancialService.getFinancialMetrics failed", {
        ticker,
        error: result.error,
      });

      logInfo("Using financial fallback metrics", { ticker });
      return {
        peRatio: null,
        marketCap: null,
        revenueGrowth: null,
        eps: null,
        debtToEquity: null,
        grossMargin: null,
        operatingMargin: null,
        freeCashFlow: null,
      };
    }

    return result.data;
  }
}

export const financialService = new FinancialService();
