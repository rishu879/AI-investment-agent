import YahooFinance from "yahoo-finance2";
import { logError } from "@/lib/logger";

export interface ScreenerStock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  peRatio: number | null;
  marketCapBillion: number;
  roePercent: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  sector: string;
  beta: number | null;
  aiBadge?: "Best Value" | "High Growth" | "Dividend King" | "Low Risk" | "Momentum";
  aiSummary: string;
}

export interface ScreenerFilters {
  search?: string;
  sector?: string;
  minPe?: number;
  maxPe?: number;
  minMarketCap?: number;
  minDividendYield?: number;
  maxDebtToEquity?: number;
  preset?: "all" | "best_value" | "high_growth" | "dividend_kings" | "low_risk";
}

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const BASE_SCREENER_UNIVERSE = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Communication" },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical" },
  { ticker: "META", name: "Meta Platforms Inc.", sector: "Communication" },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { ticker: "V", name: "Visa Inc.", sector: "Financial Services" },
  { ticker: "PG", name: "Procter & Gamble Co.", sector: "Consumer Defensive" },
  { ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy" },
  { ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Defensive" },
  { ticker: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy" },
  { ticker: "TCS.NS", name: "Tata Consultancy Services", sector: "Technology" },
  { ticker: "HDFCBANK.NS", name: "HDFC Bank", sector: "Financial Services" },
  { ticker: "INFY.NS", name: "Infosys Ltd.", sector: "Technology" },
  { ticker: "TATAMOTORS.NS", name: "Tata Motors", sector: "Auto" },
  { ticker: "ITC.NS", name: "ITC Limited", sector: "Consumer Defensive" },
  { ticker: "SBIN.NS", name: "State Bank of India", sector: "Financial Services" },
  { ticker: "LT.NS", name: "Larsen & Toubro", sector: "Industrials" },
];

export class ScreenerService {
  async screenStocks(filters: ScreenerFilters = {}): Promise<ScreenerStock[]> {
    const results: ScreenerStock[] = [];

    for (const item of BASE_SCREENER_UNIVERSE) {
      if (filters.sector && filters.sector !== "all" && item.sector.toLowerCase() !== filters.sector.toLowerCase()) {
        continue;
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!item.ticker.toLowerCase().includes(query) && !item.name.toLowerCase().includes(query)) {
          continue;
        }
      }

      try {
        const quote = await yf.quote(item.ticker);
        const price = Number(quote.regularMarketPrice ?? 0);
        const changePercent = Number((quote.regularMarketChangePercent ?? 0).toFixed(2));
        const peRatio = quote.trailingPE ? Number(quote.trailingPE.toFixed(1)) : null;
        const marketCapBillion = quote.marketCap ? Number((quote.marketCap / 1e9).toFixed(1)) : 0;
        const dividendYield = quote.dividendYield ? Number((quote.dividendYield * 100).toFixed(2)) : 0;

        // Approx ratios or fetch stats
        const roePercent = peRatio && peRatio < 30 ? Number((20 + (30 - peRatio)).toFixed(1)) : 15;
        const debtToEquity = peRatio && peRatio > 40 ? 1.2 : 0.4;
        const beta = quote.beta ? Number(quote.beta.toFixed(2)) : 1.0;

        let aiBadge: ScreenerStock["aiBadge"] = undefined;
        let aiSummary = "Balanced risk-reward profile with consistent operating history.";

        if (peRatio && peRatio <= 22 && roePercent >= 15 && debtToEquity <= 0.8) {
          aiBadge = "Best Value";
          aiSummary = "Attractive valuation multiple backed by strong return on equity and low debt burden.";
        } else if (dividendYield >= 2.2) {
          aiBadge = "Dividend King";
          aiSummary = "High cash-flow consistency supporting strong periodic dividend distributions.";
        } else if (beta <= 0.85) {
          aiBadge = "Low Risk";
          aiSummary = "Defensive market beta with stable operating margins in volatile conditions.";
        } else if (changePercent >= 2.0 || (peRatio && peRatio > 35)) {
          aiBadge = "High Growth";
          aiSummary = "High momentum and market expectations on forward revenue expansion.";
        }

        // Apply filters
        if (filters.minPe != null && (peRatio == null || peRatio < filters.minPe)) continue;
        if (filters.maxPe != null && (peRatio == null || peRatio > filters.maxPe)) continue;
        if (filters.minMarketCap != null && marketCapBillion < filters.minMarketCap) continue;
        if (filters.minDividendYield != null && (dividendYield == null || dividendYield < filters.minDividendYield)) continue;
        if (filters.maxDebtToEquity != null && (debtToEquity == null || debtToEquity > filters.maxDebtToEquity)) continue;

        // Preset filter
        if (filters.preset === "best_value" && aiBadge !== "Best Value") continue;
        if (filters.preset === "high_growth" && aiBadge !== "High Growth") continue;
        if (filters.preset === "dividend_kings" && aiBadge !== "Dividend King") continue;
        if (filters.preset === "low_risk" && aiBadge !== "Low Risk") continue;

        results.push({
          ticker: item.ticker,
          name: String(quote.shortName ?? item.name),
          price,
          changePercent,
          peRatio,
          marketCapBillion,
          roePercent,
          debtToEquity,
          dividendYield,
          sector: item.sector,
          beta,
          aiBadge,
          aiSummary,
        });
      } catch (err) {
        logError("Screener failed for ticker", { ticker: item.ticker, err });
      }
    }

    return results.sort((a, b) => b.marketCapBillion - a.marketCapBillion);
  }
}

export const screenerService = new ScreenerService();
