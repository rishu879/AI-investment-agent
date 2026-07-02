import type { CompanySnapshot, FinancialMetrics } from "@/types/research";

export interface FinancialAnalysisPromptInput {
  company: CompanySnapshot;
  financials: FinancialMetrics;
}

export const financialAnalysisPrompt = ({
  company,
  financials,
}: FinancialAnalysisPromptInput) => `You are a financial analyst reviewing the latest published metrics for ${company.name} (${company.ticker}).

Use the provided ratios and trends to determine whether the company appears financially healthy, identify any red flags, and describe the strength of the balance sheet and profitability.

Financial Metrics:
- P/E Ratio: ${financials.peRatio ?? "N/A"}
- Market Cap: ${financials.marketCap ?? "N/A"}
- Revenue Growth: ${financials.revenueGrowth ?? "N/A"}
- EPS: ${financials.eps ?? "N/A"}
- Debt-to-Equity: ${financials.debtToEquity ?? "N/A"}
- Gross Margin: ${financials.grossMargin ?? "N/A"}
- Operating Margin: ${financials.operatingMargin ?? "N/A"}
- Free Cash Flow: ${financials.freeCashFlow ?? "N/A"}

Write a clear financial analysis in bullet points and summarize whether these metrics support an investment thesis.`;
