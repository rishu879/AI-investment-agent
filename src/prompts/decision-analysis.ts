import type { CompanySnapshot, FinancialMetrics, NewsItem, RiskAnalysis, SentimentAnalysis } from "@/types/research";

export interface DecisionAnalysisPromptInput {
  ticker: string;
  company: CompanySnapshot;
  financials: FinancialMetrics;
  news: NewsItem[];
  sentiment: SentimentAnalysis;
  risk: RiskAnalysis;
  analysis: string;
}

export const decisionAnalysisPrompt = ({
  ticker,
  company,
  financials,
  news,
  sentiment,
  risk,
  analysis,
}: DecisionAnalysisPromptInput) => `You are a senior equity research analyst drafting an investment decision for ${company.name} (${ticker}). Use the company profile, financial metrics, news summary, sentiment, and risk analysis to make a recommendation.

Company snapshot:
- Ticker: ${company.ticker}
- Name: ${company.name}
- Sector: ${company.sector}
- Industry: ${company.industry}
- Exchange: ${company.exchange}
- Market Cap: ${company.marketCap}
- Current Price: ${company.currentPrice}

Financial metrics:
- P/E Ratio: ${financials.peRatio ?? "N/A"}
- Revenue Growth: ${financials.revenueGrowth ?? "N/A"}
- EPS: ${financials.eps ?? "N/A"}
- Debt/Equity: ${financials.debtToEquity ?? "N/A"}
- Gross Margin: ${financials.grossMargin ?? "N/A"}
- Free Cash Flow: ${financials.freeCashFlow ?? "N/A"}

Recent headlines:
${news.map((item, index) => `- [${index + 1}] ${item.title} | ${item.source}`).join("\n")}

Sentiment:
- Label: ${sentiment.label}
- Score: ${sentiment.score}
- Summary: ${sentiment.summary}

Risk analysis:
- Level: ${risk.level}
- Score: ${risk.score}
- Factors: ${risk.factors.join(", ")}
- Details: ${risk.details}

Investment analysis:
${analysis}

Output a JSON object with keys:
- value: one of strong_buy, buy, hold, sell, strong_sell
- rationale: text explanation
- confidence: number between 0.0 and 1.0
`;
