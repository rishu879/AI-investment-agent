import { CompanySnapshot } from "@/types/research";
import { YahooFinanceTool } from "@/tools/yahoo-finance-tool";
import { logError, logInfo } from "@/lib/logger";

const yahooFinanceTool = new YahooFinanceTool();

export class CompanyService {
  async getCompanySnapshot(ticker: string): Promise<CompanySnapshot> {
    const result = await yahooFinanceTool.execute({ ticker });

    if (!result.ok || !result.data) {
      logError("CompanyService.getCompanySnapshot failed", {
        ticker,
        error: result.error,
      });

      logInfo("Using company fallback profile", { ticker });
      return {
        ticker: ticker.toUpperCase(),
        name: ticker.toUpperCase(),
        sector: "Unknown",
        industry: "Unknown",
        marketCap: "N/A",
        currentPrice: 0,
        currency: "USD",
        exchange: "Unknown",
        description: "Company profile unavailable. A fallback profile was generated.",
      };
    }

    return result.data;
  }
}

export const companyService = new CompanyService();
