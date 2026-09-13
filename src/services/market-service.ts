import YahooFinance from "yahoo-finance2";
import { logError, logInfo } from "@/lib/logger";

export interface MarketIndex {
  symbol: string;
  name: string;
  region: "India" | "US" | "Global";
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  currency: string;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
  topStock: string;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface MarketOverviewData {
  indices: MarketIndex[];
  gainers: MarketMover[];
  losers: MarketMover[];
  mostActive: MarketMover[];
  sectors: SectorPerformance[];
  timestamp: string;
}

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const INDEX_CONFIG = [
  { symbol: "^NSEI", name: "Nifty 50", region: "India" as const, currency: "INR" },
  { symbol: "^BSESN", name: "BSE Sensex", region: "India" as const, currency: "INR" },
  { symbol: "^NSEBANK", name: "Bank Nifty", region: "India" as const, currency: "INR" },
  { symbol: "^GSPC", name: "S&P 500", region: "US" as const, currency: "USD" },
  { symbol: "^IXIC", name: "Nasdaq 100", region: "US" as const, currency: "USD" },
  { symbol: "^DJI", name: "Dow Jones", region: "US" as const, currency: "USD" },
];

const MONITORED_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", sector: "Technology" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Financial Services" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Auto" },
  { symbol: "INFY.NS", name: "Infosys Ltd.", sector: "Technology" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", sector: "Financial Services" },
];

export class MarketService {
  async getMarketOverview(): Promise<MarketOverviewData> {
    const indices: MarketIndex[] = [];

    // 1. Fetch Major Indices
    for (const item of INDEX_CONFIG) {
      try {
        const quote = await yf.quote(item.symbol);
        const price = Number(quote.regularMarketPrice ?? 0);
        const change = Number(quote.regularMarketChange ?? 0);
        const changePercent = Number(quote.regularMarketChangePercent ?? 0);

        indices.push({
          symbol: item.symbol,
          name: item.name,
          region: item.region,
          price,
          change,
          changePercent: Number(changePercent.toFixed(2)),
          dayHigh: Number(quote.regularMarketDayHigh ?? price),
          dayLow: Number(quote.regularMarketDayLow ?? price),
          currency: item.currency,
        });
      } catch (err) {
        logError("Failed to fetch index quote", { symbol: item.symbol, err });
        indices.push({
          symbol: item.symbol,
          name: item.name,
          region: item.region,
          price: 0,
          change: 0,
          changePercent: 0,
          dayHigh: 0,
          dayLow: 0,
          currency: item.currency,
        });
      }
    }

    // 2. Fetch Monitored Movers
    const movers: MarketMover[] = [];
    for (const item of MONITORED_STOCKS) {
      try {
        const quote = await yf.quote(item.symbol);
        const price = Number(quote.regularMarketPrice ?? 0);
        const change = Number(quote.regularMarketChange ?? 0);
        const changePercent = Number((quote.regularMarketChangePercent ?? 0).toFixed(2));
        const volume = Number(quote.regularMarketVolume ?? 0);
        const marketCapRaw = quote.marketCap ?? 0;
        const marketCap =
          marketCapRaw >= 1e12
            ? `$${(marketCapRaw / 1e12).toFixed(2)}T`
            : marketCapRaw >= 1e9
            ? `$${(marketCapRaw / 1e9).toFixed(1)}B`
            : "N/A";

        movers.push({
          symbol: item.symbol,
          name: String(quote.shortName ?? item.name),
          price,
          change,
          changePercent,
          volume,
          marketCap,
          sector: item.sector,
        });
      } catch (err) {
        logError("Failed to fetch mover quote", { symbol: item.symbol, err });
      }
    }

    // Sort Gainers, Losers, and Most Active
    const sortedByReturn = [...movers].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sortedByReturn.filter((m) => m.changePercent >= 0).slice(0, 5);
    const losers = [...sortedByReturn].reverse().filter((m) => m.changePercent < 0).slice(0, 5);
    const mostActive = [...movers].sort((a, b) => b.volume - a.volume).slice(0, 5);

    // 3. Sector Performance Aggregation
    const sectorMap: Record<string, { totalChange: number; count: number; topStock: string; maxChange: number }> = {};
    for (const stock of movers) {
      if (!sectorMap[stock.sector]) {
        sectorMap[stock.sector] = { totalChange: 0, count: 0, topStock: stock.symbol, maxChange: stock.changePercent };
      }
      sectorMap[stock.sector].totalChange += stock.changePercent;
      sectorMap[stock.sector].count += 1;
      if (stock.changePercent > sectorMap[stock.sector].maxChange) {
        sectorMap[stock.sector].topStock = stock.symbol;
        sectorMap[stock.sector].maxChange = stock.changePercent;
      }
    }

    const sectors: SectorPerformance[] = Object.entries(sectorMap).map(([sector, data]) => {
      const avg = Number((data.totalChange / Math.max(1, data.count)).toFixed(2));
      return {
        sector,
        changePercent: avg,
        topStock: data.topStock,
        sentiment: avg > 0.5 ? "bullish" : avg < -0.5 ? "bearish" : "neutral",
      };
    });

    return {
      indices,
      gainers,
      losers,
      mostActive,
      sectors,
      timestamp: new Date().toISOString(),
    };
  }
}

export const marketService = new MarketService();
