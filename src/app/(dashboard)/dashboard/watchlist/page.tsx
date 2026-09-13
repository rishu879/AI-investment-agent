"use client";

import { useState, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldAlert,
  Target,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface WatchItem {
  id: string;
  ticker: string;
  name: string;
  currentPrice: number;
  currency: string;
  change: number;
  changePercent: number;
  targetPrice?: number;
  stopLossPrice?: number;
  notes?: string;
  alertsEnabled: boolean;
  addedAt: string;
}

const DEFAULT_WATCHLIST: WatchItem[] = [
  {
    id: "w-1",
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    currentPrice: 125.4,
    currency: "USD",
    change: 3.85,
    changePercent: 3.17,
    targetPrice: 140.0,
    stopLossPrice: 112.0,
    notes: "Accumulate near support. Key catalyst: upcoming Blackwell earnings.",
    alertsEnabled: true,
    addedAt: "2026-03-01",
  },
  {
    id: "w-2",
    ticker: "RELIANCE.NS",
    name: "Reliance Industries Ltd",
    currentPrice: 2980.5,
    currency: "INR",
    change: 34.2,
    changePercent: 1.16,
    targetPrice: 3150.0,
    stopLossPrice: 2840.0,
    notes: "Retail and Telecom segment value unlocking plays.",
    alertsEnabled: true,
    addedAt: "2026-03-05",
  },
  {
    id: "w-3",
    ticker: "AAPL",
    name: "Apple Inc.",
    currentPrice: 228.15,
    currency: "USD",
    change: -1.25,
    changePercent: -0.54,
    targetPrice: 245.0,
    stopLossPrice: 215.0,
    notes: "Apple Intelligence upgrade cycle momentum.",
    alertsEnabled: true,
    addedAt: "2026-03-06",
  },
  {
    id: "w-4",
    ticker: "TATAMOTORS.NS",
    name: "Tata Motors Ltd",
    currentPrice: 995.0,
    currency: "INR",
    change: 18.7,
    changePercent: 1.92,
    targetPrice: 1050.0,
    stopLossPrice: 940.0,
    notes: "EV market share expansion & JLR margin improvement.",
    alertsEnabled: true,
    addedAt: "2026-03-08",
  },
  {
    id: "w-5",
    ticker: "MSFT",
    name: "Microsoft Corporation",
    currentPrice: 442.8,
    currency: "USD",
    change: 5.1,
    changePercent: 1.16,
    targetPrice: 470.0,
    stopLossPrice: 420.0,
    notes: "Azure AI acceleration & enterprise Copilot monetization.",
    alertsEnabled: true,
    addedAt: "2026-03-10",
  },
];

const WATCHLIST_STORAGE_KEY = "ai_investment_watchlist_v1";

// Simple client-side store with useSyncExternalStore for hydration safety
let memoryWatchlist: WatchItem[] = DEFAULT_WATCHLIST;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getWatchlistSnapshot(): WatchItem[] {
  return memoryWatchlist;
}

function getServerSnapshot(): WatchItem[] {
  return DEFAULT_WATCHLIST;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Initialize from storage on browser
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (raw) {
      memoryWatchlist = JSON.parse(raw);
    } else {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST));
    }
  } catch {
    memoryWatchlist = DEFAULT_WATCHLIST;
  }
}

function persistWatchlist(items: WatchItem[]) {
  memoryWatchlist = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage error
    }
  }
  emitChange();
}

export default function WatchlistPage() {
  const watchlist = useSyncExternalStore(subscribe, getWatchlistSnapshot, getServerSnapshot);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "alerts" | "us" | "india">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New stock form
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newTarget, setNewTarget] = useState("");
  const [newStopLoss, setNewStopLoss] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim()) return;

    const tickerUpper = newTicker.trim().toUpperCase();
    const isIndia = tickerUpper.endsWith(".NS") || tickerUpper.endsWith(".BO");
    const currency = isIndia ? "INR" : newCurrency;
    const price = parseFloat(newPrice) || 100;

    const newItem: WatchItem = {
      id: `w-${Date.now()}`,
      ticker: tickerUpper,
      name: newName.trim() || tickerUpper,
      currentPrice: price,
      currency,
      change: 0,
      changePercent: 0,
      targetPrice: newTarget ? parseFloat(newTarget) : undefined,
      stopLossPrice: newStopLoss ? parseFloat(newStopLoss) : undefined,
      notes: newNotes.trim() || undefined,
      alertsEnabled: true,
      addedAt: new Date().toISOString().split("T")[0],
    };

    persistWatchlist([newItem, ...watchlist]);
    setNewTicker("");
    setNewName("");
    setNewPrice("");
    setNewTarget("");
    setNewStopLoss("");
    setNewNotes("");
    setIsAddOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    persistWatchlist(watchlist.filter(item => item.id !== id));
  };

  const handleToggleAlerts = (id: string) => {
    persistWatchlist(
      watchlist.map(item =>
        item.id === id ? { ...item, alertsEnabled: !item.alertsEnabled } : item
      )
    );
  };

  // Metrics computation
  const metrics = useMemo(() => {
    let triggeredCount = 0;
    let targetApproachingCount = 0;

    for (const item of watchlist) {
      if (!item.alertsEnabled) continue;
      if (item.targetPrice && item.currentPrice >= item.targetPrice) {
        triggeredCount++;
      } else if (item.stopLossPrice && item.currentPrice <= item.stopLossPrice) {
        triggeredCount++;
      } else if (
        item.targetPrice &&
        item.currentPrice >= item.targetPrice * 0.96 &&
        item.currentPrice < item.targetPrice
      ) {
        targetApproachingCount++;
      }
    }

    return {
      total: watchlist.length,
      triggeredCount,
      targetApproachingCount,
      activeShields: watchlist.filter(w => w.alertsEnabled && w.stopLossPrice).length,
    };
  }, [watchlist]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return watchlist.filter(item => {
      const matchSearch =
        item.ticker.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterType === "alerts") {
        const isTriggered =
          (item.targetPrice && item.currentPrice >= item.targetPrice) ||
          (item.stopLossPrice && item.currentPrice <= item.stopLossPrice);
        const isApproaching =
          item.targetPrice &&
          item.currentPrice >= item.targetPrice * 0.96 &&
          item.currentPrice < item.targetPrice;
        return Boolean(item.alertsEnabled && (isTriggered || isApproaching));
      }

      if (filterType === "us") {
        return !item.ticker.includes(".NS") && !item.ticker.includes(".BO");
      }

      if (filterType === "india") {
        return item.ticker.includes(".NS") || item.ticker.includes(".BO");
      }

      return true;
    });
  }, [watchlist, search, filterType]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Watchlist & Price Alerts</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Real-Time Tracking
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor institutional conviction targets, define risk stop-losses, and track algorithmic price triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Asset to Watchlist
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Watched Assets
            </CardTitle>
            <Bookmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Equities & ETFs across US & India</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Active Triggers
            </CardTitle>
            <Bell className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.triggeredCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Price targets reached or breached</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-500/20 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              Approaching Target
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.targetApproachingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within 4% of designated profit target</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Stop-Loss Shields
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.activeShields}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Automated downside risk protection</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Stock Modal / Form Expandable */}
      {isAddOpen && (
        <Card className="border-primary/30 shadow-md bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Add New Asset to Watchlist
            </CardTitle>
            <CardDescription className="text-xs">
              Enter the ticker symbol (e.g., TSLA, INFY.NS) with custom target and risk thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Ticker Symbol *
                  </label>
                  <Input
                    placeholder="e.g. INFY.NS or GOOGL"
                    value={newTicker}
                    onChange={e => setNewTicker(e.target.value)}
                    required
                    className="font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Company Name
                  </label>
                  <Input
                    placeholder="e.g. Infosys Limited"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Current Estimated Price
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="1800.00"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Currency
                  </label>
                  <select
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Target Price (Take Profit)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Optional target"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Stop-Loss Threshold
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Optional stop loss"
                    value={newStopLoss}
                    onChange={e => setNewStopLoss(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Analyst Thesis / Notes
                  </label>
                  <Input
                    placeholder="Key catalyst or accumulation range"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Save to Watchlist
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search watched symbols or names..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => setFilterType("all")}
          >
            All Assets ({watchlist.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "alerts" ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => setFilterType("alerts")}
          >
            Triggered & Close ({metrics.triggeredCount + metrics.targetApproachingCount})
          </Button>
          <Button
            size="sm"
            variant={filterType === "us" ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => setFilterType("us")}
          >
            US Equities
          </Button>
          <Button
            size="sm"
            variant={filterType === "india" ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => setFilterType("india")}
          >
            NSE / BSE India
          </Button>
        </div>
      </div>

      {/* Watchlist Table / Cards */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Asset</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Day Change</th>
                <th className="py-3 px-4 text-center">Alert Status</th>
                <th className="py-3 px-4 text-right">Target Price</th>
                <th className="py-3 px-4 text-right">Stop-Loss</th>
                <th className="py-3 px-4 text-left hidden lg:table-cell">Investment Thesis</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No watch items found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or add a new stock.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const currSymbol = item.currency === "INR" ? "₹" : "$";
                  const isGain = item.change >= 0;

                  // Target status
                  let statusBadge = (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground border-border">
                      Normal Tracking
                    </Badge>
                  );

                  if (item.alertsEnabled) {
                    if (item.targetPrice && item.currentPrice >= item.targetPrice) {
                      statusBadge = (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Target Hit
                        </Badge>
                      );
                    } else if (item.stopLossPrice && item.currentPrice <= item.stopLossPrice) {
                      statusBadge = (
                        <Badge variant="destructive" className="text-[11px] gap-1">
                          <AlertTriangle className="h-3 w-3" /> Stop-Loss Alert
                        </Badge>
                      );
                    } else if (
                      item.targetPrice &&
                      item.currentPrice >= item.targetPrice * 0.96 &&
                      item.currentPrice < item.targetPrice
                    ) {
                      statusBadge = (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] gap-1">
                          <Target className="h-3 w-3" /> Near Target
                        </Badge>
                      );
                    }
                  } else {
                    statusBadge = (
                      <Badge variant="secondary" className="text-[11px] text-muted-foreground">
                        Alerts Muted
                      </Badge>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleToggleAlerts(item.id)}
                            title={item.alertsEnabled ? "Mute alerts" : "Enable alerts"}
                            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                          >
                            <Bell
                              className={`h-4 w-4 ${
                                item.alertsEnabled ? "text-primary fill-primary/20" : "opacity-30"
                              }`}
                            />
                          </button>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {item.ticker}
                              {item.ticker.includes(".NS") && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                  NSE
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[140px] md:max-w-[200px]">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold">
                        {currSymbol}
                        {item.currentPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
                            isGain
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isGain ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {isGain ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">{statusBadge}</td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs">
                        {item.targetPrice ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {currSymbol}
                            {item.targetPrice.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs">
                        {item.stopLossPrice ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            {currSymbol}
                            {item.stopLossPrice.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                        {item.notes || <span className="opacity-40 italic">No notes added</span>}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            title="Open Technical & AI Predictor"
                          >
                            <Link href={`/dashboard/technical?ticker=${encodeURIComponent(item.ticker)}`}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Deep Company Research"
                          >
                            <Link href={`/dashboard/research?ticker=${encodeURIComponent(item.ticker)}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
