import { technicalService, TechnicalIndicatorSummary } from "@/services/technical-service";
import { GeminiTool } from "@/tools/gemini-tool";
import { logError, logInfo } from "@/lib/logger";

export interface AiPredictionResult {
  ticker: string;
  currentPrice: number;
  direction: "bullish" | "bearish" | "sideways";
  confidenceScore: number;
  timeframe: "short_term_7d";
  predictedRange: {
    low: number;
    high: number;
    target: number;
    potentialReturnPercent: number;
  };
  mlSignals: {
    rsiScore: number;
    macdMomentum: "positive" | "negative" | "neutral";
    trendStrength: "strong" | "moderate" | "weak";
    volatilityRegime: "high" | "normal" | "low";
  };
  keyDrivers: string[];
  keyRisks: string[];
  verdictSummary: string;
  technicalSummary: TechnicalIndicatorSummary;
}

const geminiTool = new GeminiTool();

export class AiPredictionService {
  async predictStock(ticker: string): Promise<AiPredictionResult> {
    const formattedTicker = ticker.toUpperCase().trim();
    const technicals = await technicalService.getTechnicalAnalysis(formattedTicker);

    const price = technicals.currentPrice;
    const rsi = technicals.rsi.value;
    const trend = technicals.movingAverages.trend;
    const isBullish =
      rsi < 65 &&
      (trend === "strong_bullish" || trend === "bullish" || technicals.movingAverages.isGoldenCross);
    const isBearish =
      rsi > 70 ||
      trend === "strong_bearish" ||
      trend === "bearish" ||
      technicals.movingAverages.isDeathCross;

    const direction: AiPredictionResult["direction"] = isBullish
      ? "bullish"
      : isBearish
      ? "bearish"
      : "sideways";

    const targetReturn =
      direction === "bullish" ? 0.045 : direction === "bearish" ? -0.04 : 0.005;
    const targetPrice = Number((price * (1 + targetReturn)).toFixed(2));
    const rangeLow = Number((price * (1 + (direction === "bearish" ? -0.07 : -0.02))).toFixed(2));
    const rangeHigh = Number((price * (1 + (direction === "bullish" ? 0.08 : 0.02))).toFixed(2));
    const confidenceScore = Math.min(95, Math.max(55, Math.round(70 + (rsi > 50 ? 5 : -5))));

    let verdictSummary = `${formattedTicker} is currently exhibiting ${direction} technical characteristics on the daily timeframe.`;
    const keyDrivers: string[] = [];
    const keyRisks: string[] = [];

    if (technicals.signals.length > 0) {
      technicals.signals.forEach((s) => {
        if (s.type === "bullish") keyDrivers.push(s.description);
        else if (s.type === "bearish") keyRisks.push(s.description);
      });
    }

    if (keyDrivers.length === 0) {
      keyDrivers.push("Price maintaining support above key dynamic moving averages.");
    }
    if (keyRisks.length === 0) {
      keyRisks.push("Broader macroeconomic index volatility and interest rate sensitivity.");
    }

    // Try Gemini AI enhancement
    try {
      const prompt = `You are a Quantitative Financial Technical Analyst. Analyze the following technical signals for stock ${formattedTicker}:
- Current Price: $${price}
- 14-day RSI: ${rsi}
- Moving Average Trend: ${trend}
- Key Resistance: $${technicals.keyLevels.resistance1}
- Key Support: $${technicals.keyLevels.support1}
- Signals: ${technicals.signals.map((s) => s.name).join(", ") || "None"}

Provide a concise 2-sentence executive prediction synthesis on whether this asset presents a favorable risk-reward setup for the next 7-14 days. Keep it analytical and data-driven.`;

      const aiResponse = await geminiTool.execute({ prompt });
      if (aiResponse.ok && aiResponse.data?.text?.trim()) {
        verdictSummary = aiResponse.data.text.trim();
      }
    } catch (error) {
      logError("Gemini prediction synthesis failed; using quantitative fallback", { ticker: formattedTicker, error });
    }

    return {
      ticker: formattedTicker,
      currentPrice: price,
      direction,
      confidenceScore,
      timeframe: "short_term_7d",
      predictedRange: {
        low: rangeLow,
        high: rangeHigh,
        target: targetPrice,
        potentialReturnPercent: Number((targetReturn * 100).toFixed(2)),
      },
      mlSignals: {
        rsiScore: Number(rsi.toFixed(1)),
        macdMomentum: technicals.macd.histogram > 0 ? "positive" : technicals.macd.histogram < 0 ? "negative" : "neutral",
        trendStrength: trend.includes("strong") ? "strong" : "moderate",
        volatilityRegime: technicals.bollingerBands.bandwidth > 15 ? "high" : technicals.bollingerBands.bandwidth < 8 ? "low" : "normal",
      },
      keyDrivers,
      keyRisks,
      verdictSummary,
      technicalSummary: technicals,
    };
  }
}

export const aiPredictionService = new AiPredictionService();
