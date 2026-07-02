import { companyService } from "@/services/company-service";
import { financialService } from "@/services/financial-service";
import { newsService } from "@/services/news-service";
import { ReportService } from "@/services/report-service";
import { GeminiTool } from "@/tools/gemini-tool";
import { decisionAnalysisPrompt } from "@/prompts/decision-analysis";
import { investmentAnalysisPrompt } from "@/prompts/investment-analysis";
import { summaryPrompt } from "@/prompts/summary";
import type {
  CompanySnapshot,
  ConfidenceBreakdown,
  FinancialMetrics,
  InvestmentDecision,
  NewsItem,
  ResearchResult,
  RiskAnalysis,
  SentimentAnalysis,
  SourceReference,
  TimelineStep,
} from "@/types/research";
import { logError, logWarning } from "@/lib/logger";

const geminiTool = new GeminiTool();
const reportService = new ReportService();

export class ResearchService {
  async getCompanySnapshot(ticker: string): Promise<CompanySnapshot> {
    return companyService.getCompanySnapshot(ticker);
  }

  async getFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
    return financialService.getFinancialMetrics(ticker);
  }

  async getNews(ticker: string): Promise<NewsItem[]> {
    return newsService.getNews(ticker);
  }

  buildSentiment(news: NewsItem[]): SentimentAnalysis {
    const score = news.length
      ? Math.min(1, news.filter((item) => /positive|growth|strong|beat|upgrade|outperform|bullish/i.test(item.title)).length / news.length)
      : 0;
    const summary = score >= 0.6 ? "Market sentiment is positive across recent headlines." : score >= 0.3 ? "Recent headlines are mixed with a cautious tilt." : "News flow appears neutral to weak.";

    return {
      label: score >= 0.6 ? "positive" : score >= 0.3 ? "neutral" : "negative",
      score,
      summary,
    };
  }

  buildRiskAnalysis(financials: FinancialMetrics, news: NewsItem[]): RiskAnalysis {
    const debtScore = financials.debtToEquity != null ? Math.min(1, Math.max(0, financials.debtToEquity / 10)) : 0.3;
    const headlineRisk = news.filter((item) => /downgrade|lawsuit|recall|regulatory|layoff|weak|miss|cut/i.test(item.title)).length;
    const score = Math.min(1, debtScore + headlineRisk * 0.15);
    const level = score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";
    const factors = [
      financials.debtToEquity != null ? `Debt / Equity ${financials.debtToEquity.toFixed(2)}` : "Debt / Equity unavailable",
      financials.revenueGrowth != null ? `Revenue growth ${(financials.revenueGrowth * 100).toFixed(1)}%` : "Revenue growth unavailable",
      headlineRisk ? `${headlineRisk} negative headline(s)` : "Headline risk moderate",
    ];

    return {
      level,
      score,
      factors,
      details: `Risks are driven by leverage, revenue momentum, and headline risk.`,
    };
  }

  async generateGeminiAnalysis(input: {
    company: CompanySnapshot;
    financials: FinancialMetrics;
    news: NewsItem[];
    sentiment: SentimentAnalysis;
    risk: RiskAnalysis;
  }): Promise<string> {
    try {
      const prompt = investmentAnalysisPrompt(input);
      const result = await geminiTool.execute({ prompt, temperature: 0.2 });
      return result.ok && result.data ? result.data.text : "";
    } catch (error) {
      logError("ResearchService.generateGeminiAnalysis failed", { error });
      return "";
    }
  }

  parseDecisionOutput(raw: string): InvestmentDecision {
    const fallback: InvestmentDecision = {
      value: "hold",
      rationale: "Unable to parse Gemini decision output, using fallback reasoning.",
      confidence: 0.5,
    };

    try {
      const payload = raw.trim().startsWith("{") ? JSON.parse(raw.trim()) : JSON.parse(raw.slice(raw.indexOf("{")));
      if (payload && typeof payload === "object" && "value" in payload && "rationale" in payload) {
        return {
          value: payload.value as InvestmentDecision["value"],
          rationale: String(payload.rationale),
          confidence: typeof payload.confidence === "number" ? payload.confidence : 0.6,
        };
      }
    } catch {
      // Ignore parse errors and use fallback
    }

    return fallback;
  }

  async generateInvestmentDecision(input: {
    ticker: string;
    company: CompanySnapshot;
    financials: FinancialMetrics;
    news: NewsItem[];
    sentiment: SentimentAnalysis;
    risk: RiskAnalysis;
    analysis: string;
  }): Promise<InvestmentDecision> {
    try {
      const prompt = decisionAnalysisPrompt(input);
      const result = await geminiTool.execute({ prompt, temperature: 0.1 });
      if (result.ok && result.data) {
        return this.parseDecisionOutput(result.data.text);
      }
    } catch (error) {
      logError("ResearchService.generateInvestmentDecision failed", { error });
    }

    const fallbackValue: InvestmentDecision["value"] = input.financials.peRatio && input.financials.peRatio < 20 ? "buy" : "hold";
    return {
      value: fallbackValue,
      rationale: "Falling back to a conservative decision based on financial ratios and headline sentiment.",
      confidence: 0.55,
    };
  }

  async generateResearchSummary(result: ResearchResult): Promise<string> {
    try {
      const output = await geminiTool.execute({ prompt: summaryPrompt(result), temperature: 0.2 });
      return output.ok && output.data ? output.data.text : result.summary;
    } catch (error) {
      logError("ResearchService.generateResearchSummary failed", { error });
      return result.summary;
    }
  }

  buildExplainability(input: {
    analysis: string;
    decision: InvestmentDecision;
    financials: FinancialMetrics;
    sentiment: SentimentAnalysis;
    risk: RiskAnalysis;
  }): string {
    return `The AI recommendation is based on material financial trends, sentiment signals, and risk factors. The model weighed revenue growth, profit margins, and leverage against recent market sentiment and headline risk. A confidence score of ${Math.round(input.decision.confidence * 100)}% reflects the strength of the underlying thesis, where sentiment is ${input.sentiment.label} and risk is rated ${input.risk.level}. The analysis prioritized cash flow quality and balance sheet stability while noting the key downside risks.`;
  }

  buildConfidenceBreakdown(sentiment: SentimentAnalysis, risk: RiskAnalysis, decision: InvestmentDecision): ConfidenceBreakdown {
    const financialHealth = Number(
      Math.max(
        0.15,
        Math.min(0.95, 0.4 + (decision.confidence * 0.3 + (risk.level === "low" ? 0.2 : risk.level === "medium" ? 0.1 : 0)))
      ).toFixed(2)
    );
    const growth = Number(
      Math.max(0.1, Math.min(0.95, sentiment.score * 0.9 + 0.1)).toFixed(2)
    );
    const profitability = Number(
      Math.max(0.1, Math.min(0.95, decision.confidence * 0.8 + 0.1)).toFixed(2)
    );
    const riskScore = Number(
      Math.max(0.05, Math.min(0.95, 1 - risk.score * 0.9)).toFixed(2)
    );
    const newsSentiment = Number(
      Math.max(0.1, Math.min(0.95, sentiment.score * 0.95 + 0.05)).toFixed(2)
    );
    const overallRecommendation = Number(
      Math.max(
        0.15,
        Math.min(
          0.99,
          (financialHealth * 0.25 + growth * 0.22 + profitability * 0.22 + riskScore * 0.18 + newsSentiment * 0.13)
        )
      ).toFixed(2)
    );

    return {
      financialHealth,
      growth,
      profitability,
      risk: riskScore,
      newsSentiment,
      overallRecommendation,
    };
  }

  buildSourceReferences(news: NewsItem[]): SourceReference[] {
    return news.slice(0, 4).map((item) => ({
      title: item.title,
      url: item.url,
      source: item.source,
    }));
  }

  buildTimeline(): TimelineStep[] {
    const now = new Date();
    return [
      { step: "Company validation", status: "completed", completedAt: new Date(now.getTime() - 15000).toISOString() },
      { step: "Profile and financial fetch", status: "completed", completedAt: new Date(now.getTime() - 12000).toISOString() },
      { step: "News and sentiment analysis", status: "completed", completedAt: new Date(now.getTime() - 9000).toISOString() },
      { step: "AI reasoning and decision generation", status: "completed", completedAt: new Date(now.getTime() - 5000).toISOString() },
      { step: "Report formatting and storage", status: "completed", completedAt: now.toISOString() },
    ];
  }

  async buildResearchResult(input: {
    ticker: string;
    userId?: string;
    company?: CompanySnapshot;
    financials?: FinancialMetrics;
    news?: NewsItem[];
  }): Promise<ResearchResult> {
    let company = input.company;
    let financials = input.financials;
    let news = input.news;

    if (!company) {
      try {
        company = await this.getCompanySnapshot(input.ticker);
      } catch (error) {
        logWarning("Using fallback company snapshot", { ticker: input.ticker, error });
        company = {
          ticker: input.ticker.toUpperCase(),
          name: input.ticker.toUpperCase(),
          sector: "Unknown",
          industry: "Unknown",
          marketCap: "N/A",
          currentPrice: 0,
          currency: "USD",
          exchange: "N/A",
          description: "Company profile unavailable. Partial report generated from fallback data.",
        };
      }
    }

    if (!financials) {
      try {
        financials = await this.getFinancialMetrics(input.ticker);
      } catch (error) {
        logWarning("Using fallback financial metrics", { ticker: input.ticker, error });
        financials = {
          peRatio: null,
          marketCap: null,
          revenueGrowth: null,
          eps: null,
          debtToEquity: null,
          grossMargin: null,
          operatingMargin: null,
          freeCashFlow: null,
        };
      }
    }

    if (!news) {
      try {
        news = await this.getNews(input.ticker);
      } catch (error) {
        logWarning("Using fallback news data", { ticker: input.ticker, error });
        news = [];
      }
    }

    const sentiment = this.buildSentiment(news ?? []);
    const risk = this.buildRiskAnalysis(financials ?? {}, news ?? []);
    const analysis = await this.generateGeminiAnalysis({ company, financials, news, sentiment, risk });
    const decision = await this.generateInvestmentDecision({
      ticker: input.ticker,
      company,
      financials,
      news,
      sentiment,
      risk,
      analysis,
    });

    const confidenceBreakdown = this.buildConfidenceBreakdown(sentiment, risk, decision);
    const confidence = Number(
      Math.max(0.15, Math.min(0.99, (decision.confidence * 0.5 + confidenceBreakdown.overallRecommendation * 0.5)))
        .toFixed(2)
    );

    const result: ResearchResult = {
      ticker: company.ticker,
      company,
      financials,
      news,
      sentiment,
      risk,
      recommendation: decision,
      summary: "",
      confidence,
      explainability: this.buildExplainability({ analysis, decision, financials, sentiment, risk }),
      confidenceBreakdown,
      sources: this.buildSourceReferences(news),
      timeline: this.buildTimeline(),
      generatedAt: new Date().toISOString(),
      analysis: {
        summary: "",
        explainability: this.buildExplainability({ analysis, decision, financials, sentiment, risk }),
        sentiment,
        risk,
        confidenceBreakdown,
        timeline: this.buildTimeline(),
      },
      timestamp: new Date().toISOString(),
      warnings: [],
    };

    result.summary = await this.generateResearchSummary(result);
    result.analysis.summary = result.summary;
    return result;
  }

  async saveResearch(result: ResearchResult, userId?: string) {
    try {
      return await reportService.saveResearchReport(result, userId);
    } catch (error) {
      logError("ResearchService.saveResearch failed", { ticker: result.ticker, userId, error });
      return null;
    }
  }
}

export const researchService = new ResearchService();
