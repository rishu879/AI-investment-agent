import type { FinancialMetrics, NewsItem } from "@/types/research";

export interface RiskAnalysisPromptInput {
  financials: FinancialMetrics;
  news: NewsItem[];
}

export const riskAnalysisPrompt = ({
  financials,
  news,
}: RiskAnalysisPromptInput) => `You are responsible for identifying risk factors for an investment in a public company.

Consider the financial ratios and recent news headlines carefully.

Financial metrics:
- Debt-to-Equity: ${financials.debtToEquity ?? "N/A"}
- P/E Ratio: ${financials.peRatio ?? "N/A"}
- Revenue Growth: ${financials.revenueGrowth ?? "N/A"}
- Free Cash Flow: ${financials.freeCashFlow ?? "N/A"}

Latest headlines:
${news.map((item, index) => `- [${index + 1}] ${item.title} | ${item.source}`).join("\n")}

List the most important risk factors, categorize them as financial, operational, or market risks, and provide a concise risk level assessment (low/medium/high).`;
