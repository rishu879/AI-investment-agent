"use client";

import { useState } from "react";
import Link from "next/link";
import { useStockScreener } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Coins,
  ArrowUpDown,
  Filter,
} from "lucide-react";

export default function ScreenerPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [preset, setPreset] = useState<"all" | "best_value" | "high_growth" | "dividend_kings" | "low_risk">("all");
  const [maxPe, setMaxPe] = useState<number | undefined>(undefined);

  const { data, isLoading, isError, refetch, isFetching } = useStockScreener({
    search: search || undefined,
    sector: sector !== "all" ? sector : undefined,
    preset,
    maxPe,
  });

  const sectors = [
    "all",
    "Technology",
    "Financial Services",
    "Healthcare",
    "Consumer Cyclical",
    "Consumer Defensive",
    "Energy",
    "Auto",
    "Industrials",
    "Communication",
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            AI Quantitative Screener
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Screener</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter multi-market universe by valuation multiples, growth, balance sheet safety, and AI presets.
          </p>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={preset === "all" ? "default" : "outline"}
          onClick={() => setPreset("all")}
          className="rounded-full text-xs"
        >
          All Universe
        </Button>
        <Button
          size="sm"
          variant={preset === "best_value" ? "default" : "outline"}
          onClick={() => setPreset("best_value")}
          className="rounded-full text-xs gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Best Value (Low P/E, High ROE)
        </Button>
        <Button
          size="sm"
          variant={preset === "high_growth" ? "default" : "outline"}
          onClick={() => setPreset("high_growth")}
          className="rounded-full text-xs gap-1.5"
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> High Growth Momentum
        </Button>
        <Button
          size="sm"
          variant={preset === "dividend_kings" ? "default" : "outline"}
          onClick={() => setPreset("dividend_kings")}
          className="rounded-full text-xs gap-1.5"
        >
          <Coins className="h-3.5 w-3.5 text-blue-500" /> Dividend Yielders
        </Button>
        <Button
          size="sm"
          variant={preset === "low_risk" ? "default" : "outline"}
          onClick={() => setPreset("low_risk")}
          className="rounded-full text-xs gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-purple-500" /> Low Beta Defensive
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-border/80 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Search Ticker or Name</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 h-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Sector Filter</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Sectors" : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Max P/E Ratio</label>
            <Input
              type="number"
              placeholder="e.g. 25"
              value={maxPe ?? ""}
              onChange={(e) => setMaxPe(e.target.value ? Number(e.target.value) : undefined)}
              className="h-10 text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Screener Results Table */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>Matching Assets: {data?.length ?? 0}</span>
          {isFetching && <span className="text-primary font-medium animate-pulse">Filtering stocks...</span>}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="font-semibold text-sm">No stocks matched current screener criteria</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Try relaxing the max P/E ratio or selecting All Sectors.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPreset("all");
                setSector("all");
                setSearch("");
                setMaxPe(undefined);
              }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Ticker / Asset</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">P/E</th>
                  <th className="px-4 py-3 text-right">ROE</th>
                  <th className="px-4 py-3 text-right">Div Yield</th>
                  <th className="px-4 py-3 text-right">Market Cap</th>
                  <th className="px-4 py-3">AI Tag & Verdict</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.map((stock) => (
                  <tr key={stock.ticker} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">{stock.name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{stock.sector}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">${stock.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {stock.peRatio != null ? stock.peRatio : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {stock.roePercent != null ? `${stock.roePercent}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {stock.dividendYield != null && stock.dividendYield > 0 ? `${stock.dividendYield}%` : "0%"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">${stock.marketCapBillion}B</td>
                    <td className="px-4 py-3">
                      {stock.aiBadge ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            stock.aiBadge === "Best Value"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : stock.aiBadge === "High Growth"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : stock.aiBadge === "Dividend King"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {stock.aiBadge}
                        </span>
                      ) : null}
                      <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">
                        {stock.aiSummary}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="ghost" asChild className="h-8 px-2.5 text-xs">
                        <Link href={`/dashboard/research/${encodeURIComponent(stock.ticker)}`}>
                          Research →
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
