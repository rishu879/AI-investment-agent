import type { ResearchResult } from "@/types/research";

export const summaryPrompt = (result: ResearchResult) => `You are a senior equity research analyst. Write a clean, executive-style investment summary for ${result.company.name} (${result.ticker}) using the full research findings.

Include:
- One paragraph investment thesis
- Key strengths
- Main risks
- Investment recommendation and confidence
- A one-sentence conclusion for a fund manager

Research result:
Company: ${result.company.name} (${result.company.ticker})
Sector: ${result.company.sector ?? "Unknown"}
Industry: ${result.company.industry ?? "Unknown"}

Key metrics:
- Current Price: ${result.company.currentPrice}
- Market Cap: ${result.company.marketCap}
- P/E Ratio: ${result.financials.peRatio ?? "N/A"}
- Revenue Growth: ${result.financials.revenueGrowth ?? "N/A"}
- Debt-to-Equity: ${result.financials.debtToEquity ?? "N/A"}

Sentiment: ${result.sentiment.label} (${result.sentiment.score})
Risk: ${result.risk.level} (${result.risk.score})
Recommendation: ${result.recommendation.value}
Confidence: ${result.confidence ?? 0.0}

Write the summary in professional investment research language.`;
