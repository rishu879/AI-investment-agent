import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { CompanySnapshot, FinancialMetrics, NewsItem, ResearchResult, RiskAnalysis, SentimentAnalysis } from "@/types/research";
import { researchService } from "@/services/research-service";
import { logInfo, logWarning } from "@/lib/logger";

const ResearchState = Annotation.Root({
  ticker: Annotation<string>(),
  userId: Annotation<string | undefined>(),
  company: Annotation<CompanySnapshot | undefined>(),
  financials: Annotation<FinancialMetrics | undefined>(),
  news: Annotation<NewsItem[] | undefined>(),
  sentiment: Annotation<SentimentAnalysis | undefined>(),
  risk: Annotation<RiskAnalysis | undefined>(),
  analysis: Annotation<string | undefined>(),
  decision: Annotation<unknown | undefined>(),
  report: Annotation<ResearchResult | undefined>(),
});

export function createResearchWorkflow() {
  const workflow = new StateGraph(ResearchState)
    .addNode("ValidateCompanyNode", async (state) => {
      const ticker = state.ticker.trim().toUpperCase();
      logInfo("Company validation", { ticker });
      return { ...state, ticker };
    })
    .addNode("CompanyDataNode", async (state) => {
      try {
        const company = await researchService.getCompanySnapshot(state.ticker);
        logInfo("Yahoo Finance company fetch complete", { ticker: state.ticker });
        return { ...state, company };
      } catch (error) {
        logWarning("Yahoo Finance company fetch failed", { ticker: state.ticker, error });
        return { ...state, company: undefined };
      }
    })
    .addNode("FinancialNode", async (state) => {
      try {
        const financials = await researchService.getFinancialMetrics(state.ticker);
        logInfo("Yahoo Finance financial fetch complete", { ticker: state.ticker });
        return { ...state, financials };
      } catch (error) {
        logWarning("Yahoo Finance financial fetch failed", { ticker: state.ticker, error });
        return { ...state, financials: undefined };
      }
    })
    .addNode("NewsNode", async (state) => {
      try {
        const news = await researchService.getNews(state.ticker);
        logInfo("Google News RSS fetch complete", { ticker: state.ticker, count: news.length });
        return { ...state, news };
      } catch (error) {
        logWarning("Google News RSS fetch failed", { ticker: state.ticker, error });
        return { ...state, news: [] };
      }
    })
    .addNode("MarketSentimentNode", async (state) => ({
      ...state,
      sentiment: researchService.buildSentiment(state.news ?? []),
    }))
    .addNode("RiskAnalysisNode", async (state) => ({
      ...state,
      risk: researchService.buildRiskAnalysis(state.financials ?? {}, state.news ?? []),
    }))
    .addNode("GeminiAnalysisNode", async (state) => {
      try {
        const analysis = await researchService.generateGeminiAnalysis({
          company: state.company!,
          financials: state.financials ?? {},
          news: state.news ?? [],
          sentiment: state.sentiment!,
          risk: state.risk!,
        });
        logInfo("Gemini analysis complete", { ticker: state.ticker, length: analysis.length });
        return { ...state, analysis };
      } catch (error) {
        logWarning("Gemini analysis failed", { ticker: state.ticker, error });
        return { ...state, analysis: "" };
      }
    })
    .addNode("InvestmentDecisionNode", async (state) => {
      try {
        const decision = await researchService.generateInvestmentDecision({
          ticker: state.ticker,
          company: state.company!,
          financials: state.financials ?? {},
          news: state.news ?? [],
          sentiment: state.sentiment!,
          risk: state.risk!,
          analysis: state.analysis ?? "",
        });
        logInfo("Investment decision complete", { ticker: state.ticker, value: decision.value });
        return { ...state, decision };
      } catch (error) {
        logWarning("Investment decision failed", { ticker: state.ticker, error });
        return { ...state, decision: undefined };
      }
    })
    .addNode("SaveResearchNode", async (state) => {
      try {
        const report = await researchService.buildResearchResult({
          ticker: state.ticker,
          userId: state.userId,
          company: state.company,
          financials: state.financials,
          news: state.news,
        });
        await researchService.saveResearch(report);
        logInfo("Research report saved", { ticker: state.ticker });
        return { ...state, report };
      } catch (error) {
        logWarning("Research report save failed", { ticker: state.ticker, error });
        return { ...state, report: undefined };
      }
    })
    .addNode("ResponseFormatterNode", async (state) => ({
      ...state,
      report: state.report,
    }))
    .addEdge(START, "ValidateCompanyNode")
    .addEdge("ValidateCompanyNode", "CompanyDataNode")
    .addEdge("CompanyDataNode", "FinancialNode")
    .addEdge("FinancialNode", "NewsNode")
    .addEdge("NewsNode", "MarketSentimentNode")
    .addEdge("MarketSentimentNode", "RiskAnalysisNode")
    .addEdge("RiskAnalysisNode", "GeminiAnalysisNode")
    .addEdge("GeminiAnalysisNode", "InvestmentDecisionNode")
    .addEdge("InvestmentDecisionNode", "SaveResearchNode")
    .addEdge("SaveResearchNode", "ResponseFormatterNode")
    .addEdge("ResponseFormatterNode", END);

  return workflow.compile();
}
