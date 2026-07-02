export type RecommendationValue = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";

export interface CompanySnapshot {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: string;
  currentPrice: number;
  currency: string;
  exchange: string;
  description?: string;
}

export interface FinancialMetrics {
  peRatio?: number | null;
  marketCap?: number | null;
  revenueGrowth?: number | null;
  eps?: number | null;
  debtToEquity?: number | null;
  grossMargin?: number | null;
  operatingMargin?: number | null;
  freeCashFlow?: number | null;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  description?: string;
}

export interface SentimentAnalysis {
  label: string;
  score: number;
  summary: string;
}

export interface RiskAnalysis {
  level: "low" | "medium" | "high";
  score: number;
  factors: string[];
  details: string;
}

export interface InvestmentDecision {
  value: RecommendationValue;
  rationale: string;
  confidence: number;
}

export interface ConfidenceBreakdown {
  financialHealth: number;
  growth: number;
  profitability: number;
  risk: number;
  newsSentiment: number;
  overallRecommendation: number;
}

export interface SourceReference {
  title: string;
  url: string;
  source: string;
}

export interface TimelineStep {
  step: string;
  status: "completed" | "pending" | "failed";
  completedAt: string;
}

export interface ResearchAnalysis {
  summary: string;
  explainability: string;
  sentiment: SentimentAnalysis;
  risk: RiskAnalysis;
  confidenceBreakdown: ConfidenceBreakdown;
  timeline: TimelineStep[];
}

export interface ResearchResult {
  ticker: string;
  company: CompanySnapshot;
  financials: FinancialMetrics;
  news: NewsItem[];
  sentiment: SentimentAnalysis;
  risk: RiskAnalysis;
  recommendation: InvestmentDecision;
  summary: string;
  confidence: number;
  explainability: string;
  confidenceBreakdown: ConfidenceBreakdown;
  sources: SourceReference[];
  timeline: TimelineStep[];
  generatedAt: string;
  analysis: ResearchAnalysis;
  timestamp: string;
  warnings: string[];
}

export interface ResearchRequest {
  ticker: string;
  userId?: string;
}

export interface HistoryEntry {
  id: string;
  ticker: string;
  companyName: string;
  recommendation: string;
  score: number;
  createdAt: string;
}

export interface ResearchReportRecord {
  id: string;
  ticker: string;
  recommendation: string;
  confidence: number;
  summary: string;
  sentimentScore?: number;
  riskScore?: number;
  createdAt: string;
}

export interface ResearchResponse {
  success: boolean;
  data?: ResearchResult;
  error?: string;
  meta?: Record<string, unknown>;
}
