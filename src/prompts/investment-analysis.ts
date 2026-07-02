import type { CompanySnapshot, FinancialMetrics, NewsItem, RiskAnalysis, SentimentAnalysis } from "@/types/research";

export interface InvestmentAnalysisPromptInput {
  company: CompanySnapshot;
  financials: FinancialMetrics;
  news: NewsItem[];
  sentiment: SentimentAnalysis;
  risk: RiskAnalysis;
}

export const investmentAnalysisPrompt = ({
  company,
  financials,
  news,
  sentiment,
  risk,
}: InvestmentAnalysisPromptInput) => `You are a senior investment research analyst. Use the company snapshot, financial metrics, latest news, sentiment analysis, and risk analysis to evaluate the investment thesis.

Company:
- Ticker: ${company.ticker}
- Name: ${company.name}
- Sector: ${company.sector ?? "Unknown"}
- Industry: ${company.industry ?? "Unknown"}
- Exchange: ${company.exchange ?? "Unknown"}
- Market Cap: ${company.marketCap ?? "Unknown"}
- Current Price: ${company.currentPrice ?? "Unknown"}
- Description: ${company.description ?? "N/A"}

Financials:
- P/E Ratio: ${financials.peRatio ?? "N/A"}
- Market Cap: ${financials.marketCap ?? "N/A"}
- Revenue Growth: ${financials.revenueGrowth ?? "N/A"}
- EPS: ${financials.eps ?? "N/A"}
- Debt-to-Equity: ${financials.debtToEquity ?? "N/A"}
- Gross Margin: ${financials.grossMargin ?? "N/A"}
- Operating Margin: ${financials.operatingMargin ?? "N/A"}
- Free Cash Flow: ${financials.freeCashFlow ?? "N/A"}

News Snapshot:
${news.map((item, index) => `- [${index + 1}] ${item.title} | ${item.source} | ${item.publishedAt}
  Summary: ${item.summary ?? item.url}`).join("\n")}

Sentiment Summary:
- Label: ${sentiment.label}
- Score: ${sentiment.score}
- Summary: ${sentiment.summary}

Risk Summary:
- Level: ${risk.level}
- Score: ${risk.score}
- Factors: ${risk.factors.join(", ")}

Write an investment analysis that:
- Identifies the key growth drivers
- Highlights the principal risks
- Includes macro or market context where relevant
- Recommends one of: strong_buy, buy, hold, sell, strong_sell
- Provides a concise rationale and confidence estimate between 0 and 1
`;
