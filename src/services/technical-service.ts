import YahooFinance from "yahoo-finance2";
import { logError } from "@/lib/logger";

export interface HistoricalCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicatorSummary {
  ticker: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  period: string;
  rsi: {
    value: number;
    signal: "overbought" | "oversold" | "neutral";
    interpretation: string;
  };
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    signal: "bullish" | "bearish" | "neutral";
    interpretation: string;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    ema20: number;
    ema50: number;
    ema200: number;
    trend: "strong_bullish" | "bullish" | "neutral" | "bearish" | "strong_bearish";
    isGoldenCross: boolean;
    isDeathCross: boolean;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
    signal: "overbought" | "oversold" | "neutral";
  };
  keyLevels: {
    support1: number;
    support2: number;
    pivot: number;
    resistance1: number;
    resistance2: number;
  };
  signals: Array<{
    name: string;
    type: "bullish" | "bearish" | "neutral";
    description: string;
  }>;
  candles: HistoricalCandle[];
}

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export class TechnicalService {
  /**
   * Calculate Simple Moving Average
   */
  calculateSma(data: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        sma.push(Number((sum / period).toFixed(2)));
      }
    }
    return sma;
  }

  /**
   * Calculate Exponential Moving Average
   */
  calculateEma(data: number[], period: number): number[] {
    const ema: number[] = [];
    const k = 2 / (period + 1);

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ema.push(NaN);
      } else if (i === period - 1) {
        const slice = data.slice(0, period);
        const sum = slice.reduce((a, b) => a + b, 0);
        ema.push(Number((sum / period).toFixed(2)));
      } else {
        const currentEma = data[i] * k + ema[i - 1] * (1 - k);
        ema.push(Number(currentEma.toFixed(2)));
      }
    }
    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI 14)
   */
  calculateRsi(closes: number[], period = 14): number[] {
    const rsi: number[] = [];
    if (closes.length <= period) return closes.map(() => 50);

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = 0; i < closes.length; i++) {
      if (i < period) {
        rsi.push(NaN);
      } else if (i === period) {
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
      } else {
        const diff = closes[i] - closes[i - 1];
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? Math.abs(diff) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
      }
    }
    return rsi;
  }

  /**
   * Calculate MACD (12, 26, 9)
   */
  calculateMacd(closes: number[]) {
    const ema12 = this.calculateEma(closes, 12);
    const ema26 = this.calculateEma(closes, 26);

    const macdLine: number[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (isNaN(ema12[i]) || isNaN(ema26[i])) {
        macdLine.push(NaN);
      } else {
        macdLine.push(Number((ema12[i] - ema26[i]).toFixed(2)));
      }
    }

    const validMacdStart = macdLine.findIndex((v) => !isNaN(v));
    const validMacd = validMacdStart >= 0 ? macdLine.slice(validMacdStart) : [];
    const rawSignal = this.calculateEma(validMacd, 9);

    const signalLine: number[] = new Array(validMacdStart).fill(NaN).concat(rawSignal);
    const histogram: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
        histogram.push(NaN);
      } else {
        histogram.push(Number((macdLine[i] - signalLine[i]).toFixed(2)));
      }
    }

    return { macdLine, signalLine, histogram };
  }

  /**
   * Calculate Bollinger Bands (20, 2 std dev)
   */
  calculateBollingerBands(closes: number[], period = 20, multiplier = 2) {
    const sma20 = this.calculateSma(closes, period);
    const upper: number[] = [];
    const middle: number[] = sma20;
    const lower: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const mean = sma20[i];
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        upper.push(Number((mean + multiplier * stdDev).toFixed(2)));
        lower.push(Number((mean - multiplier * stdDev).toFixed(2)));
      }
    }

    return { upper, middle, lower };
  }

  /**
   * Fetch historical candles and compute full technical profile
   */
  async getTechnicalAnalysis(ticker: string, periodDays = 250): Promise<TechnicalIndicatorSummary> {
    const formattedTicker = ticker.toUpperCase().trim();

    try {
      const quote = await yf.quote(formattedTicker);
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Math.max(90, periodDays));

      const rawHistorical = await yf.historical(formattedTicker, {
        period1: fromDate.toISOString().split("T")[0],
        period2: toDate.toISOString().split("T")[0],
        interval: "1d",
      });

      const candles: HistoricalCandle[] = (rawHistorical || [])
        .filter((c) => c.close != null && c.open != null)
        .map((c) => ({
          date: c.date instanceof Date ? c.date.toISOString().split("T")[0] : String(c.date).split("T")[0],
          open: Number(c.open?.toFixed(2) ?? 0),
          high: Number(c.high?.toFixed(2) ?? 0),
          low: Number(c.low?.toFixed(2) ?? 0),
          close: Number(c.close?.toFixed(2) ?? 0),
          volume: Number(c.volume ?? 0),
        }));

      if (candles.length < 20) {
        throw new Error("Insufficient historical data to compute technicals.");
      }

      const closes = candles.map((c) => c.close);
      const highs = candles.map((c) => c.high);
      const lows = candles.map((c) => c.low);

      const currentPrice = quote.regularMarketPrice ?? closes[closes.length - 1];
      const prevClose = quote.regularMarketPreviousClose ?? (closes.length > 1 ? closes[closes.length - 2] : currentPrice);
      const change = Number((currentPrice - prevClose).toFixed(2));
      const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;

      // Calculate indicators
      const rsiSeries = this.calculateRsi(closes, 14);
      const latestRsi = rsiSeries[rsiSeries.length - 1] || 50;

      const { macdLine, signalLine, histogram } = this.calculateMacd(closes);
      const latestMacd = macdLine[macdLine.length - 1] || 0;
      const latestSignal = signalLine[signalLine.length - 1] || 0;
      const latestHist = histogram[histogram.length - 1] || 0;

      const sma20Series = this.calculateSma(closes, 20);
      const sma50Series = this.calculateSma(closes, 50);
      const sma200Series = this.calculateSma(closes, Math.min(200, Math.floor(closes.length * 0.9)));

      const ema20Series = this.calculateEma(closes, 20);
      const ema50Series = this.calculateEma(closes, 50);
      const ema200Series = this.calculateEma(closes, Math.min(200, Math.floor(closes.length * 0.9)));

      const latestSma20 = sma20Series[sma20Series.length - 1] || currentPrice;
      const latestSma50 = sma50Series[sma50Series.length - 1] || currentPrice;
      const latestSma200 = sma200Series[sma200Series.length - 1] || currentPrice;

      const latestEma20 = ema20Series[ema20Series.length - 1] || currentPrice;
      const latestEma50 = ema50Series[ema50Series.length - 1] || currentPrice;
      const latestEma200 = ema200Series[ema200Series.length - 1] || currentPrice;

      const bb = this.calculateBollingerBands(closes, 20, 2);
      const latestUpper = bb.upper[bb.upper.length - 1] || currentPrice * 1.05;
      const latestMiddle = bb.middle[bb.middle.length - 1] || currentPrice;
      const latestLower = bb.lower[bb.lower.length - 1] || currentPrice * 0.95;
      const bandwidth = latestMiddle > 0 ? Number((((latestUpper - latestLower) / latestMiddle) * 100).toFixed(2)) : 0;
      const percentB = latestUpper !== latestLower ? Number(((currentPrice - latestLower) / (latestUpper - latestLower)).toFixed(2)) : 0.5;

      // Classic Pivot Points
      const lastHigh = highs[highs.length - 1];
      const lastLow = lows[lows.length - 1];
      const lastClose = closes[closes.length - 1];
      const pivot = Number(((lastHigh + lastLow + lastClose) / 3).toFixed(2));
      const resistance1 = Number((2 * pivot - lastLow).toFixed(2));
      const support1 = Number((2 * pivot - lastHigh).toFixed(2));
      const resistance2 = Number((pivot + (lastHigh - lastLow)).toFixed(2));
      const support2 = Number((pivot - (lastHigh - lastLow)).toFixed(2));

      // Trend & Signals Evaluation
      const isGoldenCross = latestEma50 > latestEma200 && (ema50Series[ema50Series.length - 2] ?? 0) <= (ema200Series[ema200Series.length - 2] ?? 0);
      const isDeathCross = latestEma50 < latestEma200 && (ema50Series[ema50Series.length - 2] ?? 0) >= (ema200Series[ema200Series.length - 2] ?? 0);

      const signals: TechnicalIndicatorSummary["signals"] = [];

      // RSI Signals
      if (latestRsi >= 70) {
        signals.push({
          name: "RSI Overbought",
          type: "bearish",
          description: `RSI is currently ${latestRsi.toFixed(1)}, signalling potentially overbought momentum.`,
        });
      } else if (latestRsi <= 30) {
        signals.push({
          name: "RSI Oversold",
          type: "bullish",
          description: `RSI is currently ${latestRsi.toFixed(1)}, indicating oversold territory with bounce potential.`,
        });
      }

      // MACD Signals
      if (latestHist > 0 && latestMacd > latestSignal) {
        signals.push({
          name: "MACD Bullish Expansion",
          type: "bullish",
          description: "MACD is positive above signal line indicating ongoing upward velocity.",
        });
      } else if (latestHist < 0 && latestMacd < latestSignal) {
        signals.push({
          name: "MACD Bearish Pressure",
          type: "bearish",
          description: "MACD is below signal line with negative momentum histogram.",
        });
      }

      // Moving Average Signals
      if (isGoldenCross) {
        signals.push({
          name: "Golden Cross Triggered",
          type: "bullish",
          description: "50 EMA crossed above 200 EMA, a classic long-term bullish reversal indicator.",
        });
      } else if (isDeathCross) {
        signals.push({
          name: "Death Cross Triggered",
          type: "bearish",
          description: "50 EMA crossed below 200 EMA, indicating extended bearish bias.",
        });
      }

      if (currentPrice > latestEma20 && latestEma20 > latestEma50 && latestEma50 > latestEma200) {
        signals.push({
          name: "Full Bullish Alignment",
          type: "bullish",
          description: "Price is stacked above EMA 20, 50, and 200.",
        });
      }

      // Bollinger Bands Signals
      if (currentPrice >= latestUpper) {
        signals.push({
          name: "Upper Bollinger Band Tag",
          type: "neutral",
          description: "Price touched upper Bollinger Band; watch for consolidation or breakout expansion.",
        });
      } else if (currentPrice <= latestLower) {
        signals.push({
          name: "Lower Bollinger Band Tag",
          type: "bullish",
          description: "Price reached lower band support with mean-reversion opportunity.",
        });
      }

      const trend =
        currentPrice > latestEma50 && latestEma50 > latestEma200
          ? "strong_bullish"
          : currentPrice > latestEma50
          ? "bullish"
          : currentPrice < latestEma50 && latestEma50 < latestEma200
          ? "strong_bearish"
          : currentPrice < latestEma50
          ? "bearish"
          : "neutral";

      return {
        ticker: formattedTicker,
        currentPrice,
        change,
        changePercent,
        period: "1Y Daily",
        rsi: {
          value: latestRsi,
          signal: latestRsi >= 70 ? "overbought" : latestRsi <= 30 ? "oversold" : "neutral",
          interpretation:
            latestRsi >= 70
              ? "Overbought territory. Caution advised for fresh longs."
              : latestRsi <= 30
              ? "Oversold territory. Favorable risk-reward for swing accumulation."
              : "Neutral momentum. Oscillating within healthy range.",
        },
        macd: {
          macdLine: latestMacd,
          signalLine: latestSignal,
          histogram: latestHist,
          signal: latestHist > 0 ? "bullish" : latestHist < 0 ? "bearish" : "neutral",
          interpretation:
            latestHist > 0
              ? "Histogram expanding upward; buyers in control."
              : "Histogram downward; sellers dominant.",
        },
        movingAverages: {
          sma20: latestSma20,
          sma50: latestSma50,
          sma200: latestSma200,
          ema20: latestEma20,
          ema50: latestEma50,
          ema200: latestEma200,
          trend,
          isGoldenCross,
          isDeathCross,
        },
        bollingerBands: {
          upper: latestUpper,
          middle: latestMiddle,
          lower: latestLower,
          bandwidth,
          percentB,
          signal: percentB >= 1 ? "overbought" : percentB <= 0 ? "oversold" : "neutral",
        },
        keyLevels: {
          support2,
          support1,
          pivot,
          resistance1,
          resistance2,
        },
        signals,
        candles: candles.slice(-90), // Last 90 candles for charts
      };
    } catch (error) {
      logError("Technical analysis calculation failed", { ticker: formattedTicker, error });
      throw error;
    }
  }
}

export const technicalService = new TechnicalService();
