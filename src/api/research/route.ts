import { NextRequest } from "next/server";
import { ok, badRequest } from "@/lib/http";
import { logError, logInfo, logWarning } from "@/lib/logger";
import { researchRequestSchema } from "@/lib/validation";
import { createResearchWorkflow } from "@/langgraph/research-workflow";
import { env } from "@/config/env";
import { parseBearerToken, verifyJwt } from "@/lib/auth";

function getUserIdFromRequest(request: NextRequest) {
  const token = parseBearerToken(request.headers);
  if (!token) return null;
  const payload = verifyJwt(token);
  return payload?.sub?.toString() ?? null;
}

function buildFallbackReport(ticker: string, message: string) {
  return {
    ticker: ticker.toUpperCase(),
    company: {
      ticker: ticker.toUpperCase(),
      name: ticker.toUpperCase(),
      sector: "Unknown",
      industry: "Unknown",
      marketCap: "N/A",
      currentPrice: 0,
      currency: "USD",
      exchange: "Unknown",
      description: message,
    },
    financials: {
      peRatio: null,
      marketCap: null,
      revenueGrowth: null,
      eps: null,
      debtToEquity: null,
      grossMargin: null,
      operatingMargin: null,
      freeCashFlow: null,
    },
    news: [],
    sentiment: {
      label: "neutral",
      score: 0,
      summary: "Sentiment analysis was unavailable.",
    },
    risk: {
      level: "low",
      score: 0,
      factors: ["No risk data available"],
      details: "Risk analysis was unavailable.",
    },
    recommendation: {
      value: "hold",
      rationale: message,
      confidence: 0.4,
    },
    summary: message,
    confidence: 0.4,
    explainability: message,
    confidenceBreakdown: {
      financialHealth: 0.4,
      growth: 0.4,
      profitability: 0.4,
      risk: 0.4,
      newsSentiment: 0.4,
      overallRecommendation: 0.4,
    },
    sources: [],
    timeline: [],
    generatedAt: new Date().toISOString(),
    analysis: {
      summary: message,
      explainability: message,
      sentiment: {
        label: "neutral",
        score: 0,
        summary: "Sentiment analysis was unavailable.",
      },
      risk: {
        level: "low",
        score: 0,
        factors: ["No risk data available"],
        details: "Risk analysis was unavailable.",
      },
      confidenceBreakdown: {
        financialHealth: 0.4,
        growth: 0.4,
        profitability: 0.4,
        risk: 0.4,
        newsSentiment: 0.4,
        overallRecommendation: 0.4,
      },
      timeline: [],
    },
    timestamp: new Date().toISOString(),
    warnings: [message],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    logInfo("Incoming research request", { body });

    const parsed = researchRequestSchema.safeParse(body);

    if (!parsed.success) {
      logWarning("Invalid research request", { details: parsed.error.flatten() });
      return badRequest("Invalid research request", parsed.error.flatten());
    }

    const workflow = createResearchWorkflow();
    const userId = getUserIdFromRequest(request);
    const result = await workflow.invoke({
      ticker: parsed.data.ticker,
      userId: userId ?? parsed.data.userId,
    });

    const report = result.report ?? buildFallbackReport(parsed.data.ticker, "The workflow did not produce a complete report.");
    const payload = {
      success: true,
      company: report.company,
      financials: report.financials,
      news: report.news,
      analysis: report.analysis,
      recommendation: report.recommendation,
      confidence: report.confidence,
      sources: report.sources,
      timestamp: report.timestamp,
      warnings: report.warnings,
      sentiment: report.sentiment,
      risk: report.risk,
      summary: report.summary,
      explainability: report.explainability,
      confidenceBreakdown: report.confidenceBreakdown,
      timeline: report.timeline,
      generatedAt: report.generatedAt,
      data: report,
      userId,
    };

    logInfo("Final research response", { ticker: parsed.data.ticker, recommendation: report.recommendation?.value, warnings: payload.warnings });

    return ok(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process research request";
    logError("research route failed", { error: message });
    return ok({
      success: true,
      company: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).company,
      financials: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).financials,
      news: [],
      analysis: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).analysis,
      recommendation: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).recommendation,
      confidence: 0.4,
      sources: [],
      timestamp: new Date().toISOString(),
      warnings: [message],
      sentiment: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).sentiment,
      risk: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).risk,
      summary: message,
      explainability: message,
      confidenceBreakdown: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message).confidenceBreakdown,
      timeline: [],
      generatedAt: new Date().toISOString(),
      data: buildFallbackReport("AAPL", env.NODE_ENV === "production" ? "Research service is temporarily unavailable." : message),
    });
  }
}
