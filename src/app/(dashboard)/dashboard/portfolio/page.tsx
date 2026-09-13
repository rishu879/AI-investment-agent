"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Briefcase,
  PlusCircle,
  Trash2,
  PieChart as PieIcon,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  assetClass: string;
  sector: string;
}

const DEFAULT_HOLDINGS: Holding[] = [
  { id: "1", symbol: "AAPL", name: "Apple Inc.", shares: 15, avgBuyPrice: 180, currentPrice: 228.5, assetClass: "Stock", sector: "Technology" },
  { id: "2", symbol: "NVDA", name: "NVIDIA Corp.", shares: 25, avgBuyPrice: 110, currentPrice: 125.8, assetClass: "Stock", sector: "Technology" },
  { id: "3", symbol: "MSFT", name: "Microsoft Corp.", shares: 10, avgBuyPrice: 405, currentPrice: 428.2, assetClass: "Stock", sector: "Technology" },
  { id: "4", symbol: "RELIANCE.NS", name: "Reliance Industries", shares: 40, avgBuyPrice: 2750, currentPrice: 2980.0, assetClass: "Stock", sector: "Energy" },
  { id: "5", symbol: "HDFCBANK.NS", name: "HDFC Bank", shares: 60, avgBuyPrice: 1540, currentPrice: 1650.0, assetClass: "Stock", sector: "Financial Services" },
  { id: "6", symbol: "VOO", name: "Vanguard S&P 500 ETF", shares: 12, avgBuyPrice: 480, currentPrice: 512.4, assetClass: "ETF", sector: "Diversified" },
];

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

const PORTFOLIO_STORAGE_KEY = "ai_portfolio_holdings";

let memoryHoldings: Holding[] = DEFAULT_HOLDINGS;
const portfolioListeners = new Set<() => void>();

function emitPortfolioChange() {
  for (const listener of portfolioListeners) {
    listener();
  }
}

function getPortfolioSnapshot(): Holding[] {
  return memoryHoldings;
}

function getServerPortfolioSnapshot(): Holding[] {
  return DEFAULT_HOLDINGS;
}

function subscribePortfolio(callback: () => void) {
  portfolioListeners.add(callback);
  return () => {
    portfolioListeners.delete(callback);
  };
}

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (saved) {
      memoryHoldings = JSON.parse(saved);
    } else {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(DEFAULT_HOLDINGS));
    }
  } catch {
    memoryHoldings = DEFAULT_HOLDINGS;
  }
}

function persistHoldings(items: Holding[]) {
  memoryHoldings = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }
  emitPortfolioChange();
}

export default function PortfolioPage() {
  const holdings = useSyncExternalStore(subscribePortfolio, getPortfolioSnapshot, getServerPortfolioSnapshot);
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSector, setNewSector] = useState("Technology");

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newShares || !newPrice) return;

    const shares = parseFloat(newShares);
    const avgBuyPrice = parseFloat(newPrice);
    const currentPrice = avgBuyPrice * (1 + (Math.random() * 0.08 - 0.03)); // Simulated real-time price

    const newEntry: Holding = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase().trim(),
      name: newSymbol.toUpperCase().trim(),
      shares,
      avgBuyPrice,
      currentPrice: Number(currentPrice.toFixed(2)),
      assetClass: newSymbol.includes("ETF") || newSymbol === "VOO" ? "ETF" : "Stock",
      sector: newSector,
    };

    const updated = [newEntry, ...holdings];
    persistHoldings(updated);
    setNewSymbol("");
    setNewShares("");
    setNewPrice("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = holdings.filter((h) => h.id !== id);
    persistHoldings(updated);
  };

  // Portfolio aggregates
  const totalInvested = holdings.reduce((sum, h) => sum + h.shares * h.avgBuyPrice, 0);
  const currentTotalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  const totalProfitLoss = currentTotalValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  const isOverallPos = totalProfitLoss >= 0;

  // Sector breakdown data for Pie
  const sectorAllocations = holdings.reduce((acc, h) => {
    const val = h.shares * h.currentPrice;
    acc[h.sector] = (acc[h.sector] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(sectorAllocations).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Diversification calculation
  const maxSectorWeight =
    currentTotalValue > 0
      ? Math.max(...Object.values(sectorAllocations)) / currentTotalValue
      : 0;
  const diversificationScore = Math.max(
    40,
    Math.min(96, Math.round((1 - maxSectorWeight) * 100 + holdings.length * 4))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            Active Portfolio & Asset Allocation
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time portfolio valuation, sector diversification scoring, and AI rebalancing advice.
          </p>
        </div>

        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <PlusCircle className="h-4 w-4" /> {isAdding ? "Cancel" : "Add Holding"}
        </Button>
      </div>

      {/* Add Holding Drawer */}
      {isAdding && (
        <Card className="border-primary/40 bg-primary/5 p-4 transition-all">
          <form onSubmit={handleAddHolding} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Ticker Symbol</label>
              <Input
                placeholder="e.g. AAPL, NVDA"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="font-mono uppercase h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Quantity (Shares)</label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 10"
                value={newShares}
                onChange={(e) => setNewShares(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Avg Buy Price ($)</label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 150.50"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Sector</label>
              <select
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
              >
                <option value="Technology">Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Consumer Cyclical">Consumer Cyclical</option>
                <option value="Energy">Energy</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Diversified">Diversified ETF</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" className="w-full h-9">
                Confirm & Add
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Top Portfolio Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/80 shadow-sm">
          <CardDescription className="text-xs">Current Portfolio Value</CardDescription>
          <div className="text-2xl font-bold font-mono mt-1">
            ${currentTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Invested: ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="p-4 border-border/80 shadow-sm">
          <CardDescription className="text-xs">Unrealized Total P&L</CardDescription>
          <div
            className={`text-2xl font-bold font-mono mt-1 flex items-center gap-1 ${
              isOverallPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
            }`}
          >
            {isOverallPos ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            {isOverallPos ? "+" : ""}${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-semibold mt-1 ${isOverallPos ? "text-emerald-600" : "text-rose-600"}`}>
            {isOverallPos ? "+" : ""}{totalReturnPercent.toFixed(2)}% All-Time Return
          </div>
        </Card>

        <Card className="p-4 border-border/80 shadow-sm">
          <CardDescription className="text-xs">Diversification Health Score</CardDescription>
          <div className="text-2xl font-bold font-mono mt-1 flex items-center gap-2">
            <span>{diversificationScore}/100</span>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {diversificationScore >= 80 ? "Optimal asset spread" : "High tech concentration"}
          </div>
        </Card>

        <Card className="p-4 border-border/80 shadow-sm">
          <CardDescription className="text-xs">Holdings Count</CardDescription>
          <div className="text-2xl font-bold font-mono mt-1">{holdings.length} Assets</div>
          <div className="text-xs text-muted-foreground mt-1">Equities, ETFs, and Baskets</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sector Allocation Pie */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" /> Sector Allocation
            </CardTitle>
            <CardDescription className="text-xs">Capital distribution across market sectors.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      label={({ name, percent }) => `${name} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, "Value"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground">Add holdings to see sector distribution.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Rebalancing Recommendation */}
        <Card className="border-border/80 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> AI Portfolio Insights & Rebalancing
            </CardTitle>
            <CardDescription className="text-xs">Autonomous portfolio health recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 rounded-lg bg-muted/60 border space-y-1">
              <span className="font-bold text-foreground">Concentration Warning:</span>
              <p className="text-muted-foreground">
                Technology represents {(maxSectorWeight * 100).toFixed(0)}% of your equity exposure. Consider
                allocating fresh capital toward Healthcare or Defensive consumer goods to mitigate drawdowns.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-1">
              <span className="font-bold">Alpha Opportunity:</span>
              <p className="text-muted-foreground dark:text-inherit">
                Your top performer is delivering excess return above benchmark. Trailing stop-loss at 8% below recent
                high is recommended to lock in gains.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <Button size="sm" asChild variant="outline">
                <Link href="/dashboard/assistant">Ask AI Assistant About Rebalancing →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Holdings Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Ticker</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Avg Cost</th>
                  <th className="px-4 py-3 text-right">Current Price</th>
                  <th className="px-4 py-3 text-right">Total Value</th>
                  <th className="px-4 py-3 text-right">Profit / Loss</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {holdings.map((h) => {
                  const val = h.shares * h.currentPrice;
                  const cost = h.shares * h.avgBuyPrice;
                  const pl = val - cost;
                  const plPercent = cost > 0 ? (pl / cost) * 100 : 0;
                  const isPos = pl >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold font-mono">
                        <Link
                          href={`/dashboard/research/${encodeURIComponent(h.symbol)}`}
                          className="hover:text-primary transition-colors"
                        >
                          {h.symbol}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{h.sector}</td>
                      <td className="px-4 py-3 text-right font-mono">{h.shares}</td>
                      <td className="px-4 py-3 text-right font-mono">${h.avgBuyPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">${h.currentPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">${val.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            isPos
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPos ? "+" : ""}${pl.toFixed(2)} ({isPos ? "+" : ""}
                          {plPercent.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(h.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                          title="Remove holding"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
