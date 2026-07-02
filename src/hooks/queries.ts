"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHealth, fetchHistory, fetchResearch, deleteHistoryEntry, type HistoryResponse } from "@/services/api/backend";
import type { ResearchResult } from "@/types/research";

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
