import type { HistoryEntry, ResearchResult } from "@/types/research";

export interface HealthStatus {
  service: string;
  healthy: boolean;
  message: string;
}

export interface HistoryResponse {
  entries: HistoryEntry[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("ai-investment-agent-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchResearch(ticker: string): Promise<ResearchResult> {
  const response = await fetch(`/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ ticker }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Failed to fetch research");
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: ResearchResult;
    company?: ResearchResult["company"];
    financials?: ResearchResult["financials"];
    news?: ResearchResult["news"];
    analysis?: ResearchResult["analysis"];
    recommendation?: ResearchResult["recommendation"];
    confidence?: number;
    sources?: ResearchResult["sources"];
    timestamp?: string;
    warnings?: string[];
    error?: string;
  };
  if (!payload.success || (!payload.data && (!payload.company || !payload.recommendation))) {
    throw new Error(payload.error ?? "No research data returned");
  }

  if (payload.data) {
    return payload.data;
  }

  return {
    ticker: payload.company?.ticker ?? "",
    company: payload.company ?? { ticker: "", name: "", sector: "", industry: "", marketCap: "", currentPrice: 0, currency: "USD", exchange: "" },
    financials: payload.financials ?? {},
    news: payload.news ?? [],
    sentiment: payload.analysis?.sentiment ?? { label: "neutral", score: 0, summary: "" },
    risk: payload.analysis?.risk ?? { level: "low", score: 0, factors: [], details: "" },
    recommendation: payload.recommendation ?? { value: "hold", rationale: "", confidence: 0.4 },
    summary: payload.analysis?.summary ?? "",
    confidence: payload.confidence ?? 0.4,
    explainability: payload.analysis?.explainability ?? "",
    confidenceBreakdown: payload.analysis?.confidenceBreakdown ?? { financialHealth: 0.4, growth: 0.4, profitability: 0.4, risk: 0.4, newsSentiment: 0.4, overallRecommendation: 0.4 },
    sources: payload.sources ?? [],
    timeline: payload.analysis?.timeline ?? [],
    generatedAt: payload.timestamp ?? new Date().toISOString(),
    analysis: payload.analysis ?? { summary: "", explainability: "", sentiment: { label: "neutral", score: 0, summary: "" }, risk: { level: "low", score: 0, factors: [], details: "" }, confidenceBreakdown: { financialHealth: 0.4, growth: 0.4, profitability: 0.4, risk: 0.4, newsSentiment: 0.4, overallRecommendation: 0.4 }, timeline: [] },
    timestamp: payload.timestamp ?? new Date().toISOString(),
    warnings: payload.warnings ?? [],
  } as ResearchResult;
}

export async function fetchHistory(params?: { search?: string; page?: number; pageSize?: number }): Promise<HistoryResponse> {
  const url = new URL(`/api/history`, window.location.origin);

  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const response = await fetch(url.toString(), { headers: { ...getAuthHeaders() } });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Failed to fetch history");
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: HistoryEntry[];
    meta?: { total: number; page: number; pageSize: number };
    error?: string;
  };
  if (!payload.success || !payload.data || !payload.meta) {
    throw new Error(payload.error ?? "No history data returned");
  }

  return { entries: payload.data, meta: payload.meta };
}

export async function deleteHistoryEntry(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/history/${id}`, { method: "DELETE", headers: { ...getAuthHeaders() } });
  if (!response.ok) {
    throw new Error("Failed to delete history entry");
  }

  const payload = (await response.json()) as { success: boolean; data?: { id: string; deleted: boolean }; error?: string };
  if (!payload.success || !payload.data?.deleted) {
    throw new Error(payload.error ?? "History delete failed");
  }

  return { id: payload.data.id };
}

export async function fetchHealth(): Promise<HealthStatus[]> {
  const response = await fetch(`/api/health`);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Failed to fetch system status");
  }

  const payload = (await response.json()) as { success: boolean; data?: HealthStatus[]; error?: string };
  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? "No health data returned");
  }

  return payload.data;
}
