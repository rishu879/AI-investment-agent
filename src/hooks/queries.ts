"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHealth, fetchHistory, fetchResearch, deleteHistoryEntry, type HistoryResponse } from "@/services/api/backend";
import type { ResearchResult } from "@/types/research";
import type { MarketOverviewData } from "@/services/market-service";
import type { AiPredictionResult } from "@/services/ai-prediction-service";
import type { ScreenerStock, ScreenerFilters } from "@/services/screener-service";

export function useResearch(ticker: string) {
  return useQuery<ResearchResult, Error>({
    queryKey: ["research", ticker],
    queryFn: () => fetchResearch(ticker),
    enabled: Boolean(ticker),
    staleTime: 1000 * 60 * 2,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useHistory(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery<HistoryResponse, Error>({
    queryKey: ["history", params ?? {}],
    queryFn: () => fetchHistory(params),
    staleTime: 1000 * 60,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useDeleteHistoryEntry() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, string>({
    mutationFn: deleteHistoryEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    staleTime: 1000 * 30,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useMarketOverview() {
  return useQuery<MarketOverviewData, Error>({
    queryKey: ["market-overview"],
    queryFn: async () => {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error("Failed to load market overview");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 45,
    refetchInterval: 1000 * 60,
  });
}

export function useTechnicalAnalysis(ticker: string) {
  return useQuery<AiPredictionResult, Error>({
    queryKey: ["technical", ticker],
    queryFn: async () => {
      const res = await fetch(`/api/technical/${encodeURIComponent(ticker)}`);
      if (!res.ok) throw new Error(`Failed to load technical analysis for ${ticker}`);
      const json = await res.json();
      return json.data;
    },
    enabled: Boolean(ticker),
    staleTime: 1000 * 60 * 3,
  });
}

export function useStockScreener(filters: ScreenerFilters = {}) {
  return useQuery<ScreenerStock[], Error>({
    queryKey: ["screener", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.sector && filters.sector !== "all") params.set("sector", filters.sector);
      if (filters.preset && filters.preset !== "all") params.set("preset", filters.preset);
      if (filters.minPe != null) params.set("minPe", String(filters.minPe));
      if (filters.maxPe != null) params.set("maxPe", String(filters.maxPe));
      if (filters.minMarketCap != null) params.set("minMarketCap", String(filters.minMarketCap));
      if (filters.minDividendYield != null) params.set("minDividendYield", String(filters.minDividendYield));

      const res = await fetch(`/api/screener?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load screener data");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
