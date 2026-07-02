"use client";

import Link from "next/link";
import { SearchBar } from "@/components/dashboard/search-bar";
import { SystemStatus } from "@/components/shared/system-status";
import { useHealth, useHistory } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCcw } from "lucide-react";

export default function DashboardPage() {
  const { data: healthStatuses, isLoading: isHealthLoading, refetch: refetchHealth } = useHealth();
  const { data, isLoading: isHistoryLoading, isError: isHistoryError, refetch: refetchHistory } = useHistory();

  const latestResearch = data?.entries.slice(0, 3) ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-10 py-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Investment Research Agent
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">What would you like to research?</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Enter a company ticker or name to get an AI-powered fundamental analysis with a polished, insight-rich report.
        </p>
      </div>

      <div className="flex justify-center">
        <SearchBar />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Recent Research</h2>
                <p className="text-sm text-muted-foreground">Your most recent company analyses are shown here.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>

            {isHistoryLoading ? (
              <div className="mt-6 grid gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : isHistoryError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                Unable to load research history. Please try again.
              </div>
            ) : latestResearch.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No research history yet. Start by searching for a company ticker above.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {latestResearch.map((entry) => (
                  <Link key={entry.id} href={`/dashboard/research/${entry.ticker}`}>
                    <Card className="group cursor-pointer rounded-3xl border border-border/70 transition-all hover:border-primary/80 hover:shadow-md">
                      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          <h3 className="text-lg font-semibold">{entry.ticker}</h3>
                          <p className="text-sm text-muted-foreground">{entry.companyName}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{entry.recommendation}</span>
                          <span className="text-muted-foreground">Score {Math.round(entry.score)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">System Status</h2>
              <p className="text-sm text-muted-foreground">Service health indicators for your research pipeline.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchHealth()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          {isHealthLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : healthStatuses ? (
            <SystemStatus statuses={healthStatuses} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              Health status is unavailable. Try refreshing the page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
