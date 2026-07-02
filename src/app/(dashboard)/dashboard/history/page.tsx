"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHistory, useDeleteHistoryEntry } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isError, refetch } = useHistory({ search, page, pageSize });
  const deleteMutation = useDeleteHistoryEntry();

  const history = data?.entries ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 font-medium";
    if (score >= 50) return "text-amber-500 font-medium";
    return "text-red-500 font-medium";
  };

  const normalizedRecommendation = (value: string) => {
    return value.replace(/_/g, " ").toUpperCase();
  };

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const paginationLabel = useMemo(() => {
    if (total === 0) return "No results";
    return `Page ${page} of ${totalPages} • ${total} result${total === 1 ? "" : "s"}`;
  }, [page, total, totalPages]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-4">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
          <CardHeader>
            <CardTitle className="text-xl">Unable to load history</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-rose-700">There was a problem fetching your history. Please try again.</p>
            <Button className="mt-4" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Research History</h1>
        <EmptyState
          title="No history found"
          description="You haven't researched any companies yet."
          actionText="Research a Company"
          actionHref="/dashboard"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research History</h1>
          <p className="text-muted-foreground mt-2">Review your past AI analyses and reports.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search ticker, company, or recommendation"
          className="h-12 rounded-2xl"
          onKeyDown={(event) => event.key === "Enter" && handleSearch()}
        />
        <Button variant="secondary" className="h-12" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-background/80 p-10 text-center">
          <h2 className="text-xl font-semibold">No matching history found.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try changing your search or refresh the list.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/dashboard/research/${item.ticker}`} className="min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{item.ticker}</h3>
                      <Badge
                        variant={item.recommendation.includes("SELL") ? "destructive" : item.recommendation.includes("BUY") ? "default" : "secondary"}
                      >
                        {normalizedRecommendation(item.recommendation)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.companyName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getScoreColor(item.score)}>Score {Math.round(item.score)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-500 text-rose-500 hover:bg-rose-50"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/80 p-4">
            <p className="text-sm text-muted-foreground">{paginationLabel}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
