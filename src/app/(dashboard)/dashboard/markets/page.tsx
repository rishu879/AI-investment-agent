"use client";

import { useState } from "react";
import Link from "next/link";
import { useMarketOverview } from "@/hooks/queries";
import type { MarketMover } from "@/services/market-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Search,
  Flame,
  Globe2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function MarketsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useMarketOverview();
  const [activeTab, setActiveTab] = useState("gainers");

  const formatCurrency = (val: number, cur: string) => {
    const symbol = cur === "INR" ? "₹" : "$";
    return `${symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Globe2 className="h-3.5 w-3.5" />
            Live Global & Indian Market Pulse
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time indices, top market movers, and sector-wide sentiment heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh Live"}
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard" className="gap-1.5">
              <Search className="h-4 w-4" /> Research Ticker
            </Link>
          </Button>
        </div>
      </div>

      {/* Major Indices Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Key Benchmark Indices
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.indices.map((idx) => {
              const isPositive = idx.change >= 0;
              return (
                <Card key={idx.symbol} className="overflow-hidden border-border/80 shadow-sm hover:border-primary/40 transition-all">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{idx.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground">
                            {idx.region}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{idx.symbol}</p>
                      </div>
                      <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {isPositive ? "+" : ""}{idx.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-xl font-bold font-mono">
                        {idx.price > 0 ? formatCurrency(idx.price, idx.currency) : "—"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Day Range: {idx.dayLow > 0 ? formatCurrency(idx.dayLow, idx.currency) : "—"} - {idx.dayHigh > 0 ? formatCurrency(idx.dayHigh, idx.currency) : "—"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sector Heatmap */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-500" /> Sector Performance Heatmap
        </h2>
        {isLoading ? (
          <Skeleton className="h-36 rounded-xl" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data?.sectors.map((sec) => {
              const isPos = sec.changePercent >= 0;
              return (
                <div
                  key={sec.sector}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isPos
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                  }`}
                >
                  <div className="text-xs font-semibold truncate" title={sec.sector}>
                    {sec.sector}
                  </div>
                  <div className="my-1.5 flex items-baseline gap-1">
                    <span className="text-lg font-bold">
                      {isPos ? "+" : ""}{sec.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                    <span>Lead:</span>
                    <span className="font-mono font-medium truncate">{sec.topStock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Market Movers: Gainers / Losers / Active */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Market Movers
          </h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="gainers" className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="gap-1.5">
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" /> Top Losers
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-500" /> Most Active
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="gainers" className="m-0">
                  <MoversTable movers={data?.gainers || []} />
                </TabsContent>
                <TabsContent value="losers" className="m-0">
                  <MoversTable movers={data?.losers || []} />
                </TabsContent>
                <TabsContent value="active" className="m-0">
                  <MoversTable movers={data?.mostActive || []} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function MoversTable({ movers }: { movers: MarketMover[] }) {
  if (!movers.length) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border rounded-xl border-dashed">
        No movers data available right now.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b">
          <tr>
            <th className="px-4 py-3">Asset / Company</th>
            <th className="px-4 py-3">Sector</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">24h Change</th>
            <th className="px-4 py-3 text-right">Volume</th>
            <th className="px-4 py-3 text-right">Market Cap</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {movers.map((m) => {
            const isPos = m.changePercent >= 0;
            return (
              <tr key={m.symbol} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{m.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">{m.name}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.sector}</td>
                <td className="px-4 py-3 text-right font-mono font-medium">${m.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      isPos
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPos ? "+" : ""}{m.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                  {m.volume.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">{m.marketCap}</td>
                <td className="px-4 py-3 text-center">
                  <Button size="sm" variant="ghost" asChild className="h-8 px-2.5 text-xs">
                    <Link href={`/dashboard/research/${encodeURIComponent(m.symbol)}`}>
                      Deep Research →
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
