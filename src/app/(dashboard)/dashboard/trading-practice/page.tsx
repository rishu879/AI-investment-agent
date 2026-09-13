"use client";

import { useState, useMemo, useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  RotateCcw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  DollarSign,
  Percent,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  tradingSimulatorService,
  DEFAULT_TRADABLE_ASSETS,
  INITIAL_DEMO_BALANCE,
  type TradableAsset,
  type TradePosition,
  type ClosedTrade,
  type DemoAccount,
  type TradeSide,
  type AssetCategory,
} from "@/services/trading-simulator-service";

const DEMO_STORAGE_KEY = "ai_invest_trading_practice_v1";

interface StoredPracticeState {
  account: DemoAccount;
  positions: TradePosition[];
  closedTrades: ClosedTrade[];
}

const DEFAULT_STATE: StoredPracticeState = {
  account: {
    balance: INITIAL_DEMO_BALANCE,
    equity: INITIAL_DEMO_BALANCE,
    marginUsed: 0,
    freeMargin: INITIAL_DEMO_BALANCE,
    currency: "USD",
    initialBalance: INITIAL_DEMO_BALANCE,
  },
  positions: [
    {
      id: "demo-pos-1",
      symbol: "BTC-USD",
      name: "Bitcoin",
      category: "crypto",
      side: "long",
      leverage: 5,
      quantity: 0.5,
      entryPrice: 67200.0,
      currentPrice: 68450.0,
      margin: 6720.0,
      pnl: 625.0,
      pnlPercent: 1.86,
      takeProfit: 72000.0,
      stopLoss: 65000.0,
      liquidationPrice: 55776.0,
      openedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "demo-pos-2",
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      category: "us_stock",
      side: "long",
      leverage: 3,
      quantity: 50,
      entryPrice: 121.5,
      currentPrice: 125.4,
      margin: 2025.0,
      pnl: 195.0,
      pnlPercent: 3.21,
      takeProfit: 135.0,
      stopLoss: 115.0,
      liquidationPrice: 87.07,
      openedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  closedTrades: [
    {
      id: "demo-closed-1",
      symbol: "ETH-USD",
      name: "Ethereum",
      category: "crypto",
      side: "long",
      leverage: 10,
      quantity: 2,
      entryPrice: 3450.0,
      exitPrice: 3600.0,
      realizedPnl: 300.0,
      realizedPnlPercent: 4.35,
      closeReason: "take_profit",
      openedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      closedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
};

let memoryPracticeState: StoredPracticeState = DEFAULT_STATE;
const practiceListeners = new Set<() => void>();

function emitPracticeChange() {
  for (const listener of practiceListeners) {
    listener();
  }
}

function getPracticeSnapshot(): StoredPracticeState {
  return memoryPracticeState;
}

function getServerPracticeSnapshot(): StoredPracticeState {
  return DEFAULT_STATE;
}

function subscribePractice(callback: () => void) {
  practiceListeners.add(callback);
  return () => {
    practiceListeners.delete(callback);
  };
}

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      memoryPracticeState = JSON.parse(raw);
    } else {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    }
  } catch {
    memoryPracticeState = DEFAULT_STATE;
  }
}

function persistPracticeState(newState: StoredPracticeState) {
  memoryPracticeState = newState;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  }
  emitPracticeChange();
}

export default function TradingPracticePage() {
  const practiceData = useSyncExternalStore(
    subscribePractice,
    getPracticeSnapshot,
    getServerPracticeSnapshot
  );

  const [assets, setAssets] = useState<TradableAsset[]>(DEFAULT_TRADABLE_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC-USD");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Order Ticket State
  const [orderSide, setOrderSide] = useState<TradeSide>("long");
  const [leverage, setLeverage] = useState<number>(5);
  const [quantityInput, setQuantityInput] = useState<string>("0.1");
  const [stopLossInput, setStopLossInput] = useState<string>("");
  const [takeProfitInput, setTakeProfitInput] = useState<string>("");
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Active Tab: positions or journal
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");

  // Fetch live market quotes periodically
  useEffect(() => {
    let isMounted = true;

    async function fetchQuotes() {
      try {
        const res = await fetch("/api/practice/quotes");
        if (!res.ok) return;
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && isMounted) {
          setAssets(json.data);
        }
      } catch {}
    }

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Currently selected asset
  const selectedAsset = useMemo(() => {
    return assets.find(a => a.symbol === selectedSymbol) || assets[0];
  }, [assets, selectedSymbol]);

  // Dynamic price chart mock series based on current selected asset price
  const chartData = useMemo(() => {
    const base = selectedAsset.price;
    const points = [];
    let current = base * 0.97;
    for (let i = 1; i <= 15; i++) {
      const pseudoNoise = Math.sin(i * 1.5) * 0.3 + Math.cos(i * 0.7) * 0.2;
      const step = (Math.sin(i * 0.8) + pseudoNoise) * (base * 0.008);
      current = Math.max(base * 0.9, current + step);
      points.push({
        time: `${i * 2}m`,
        price: Number(current.toFixed(base > 10 ? 2 : 4)),
      });
    }
    points.push({ time: "Now", price: base });
    return points;
  }, [selectedAsset.price]);

  // Calculate live position P&L and total equity
  const { positionsWithPnl, totalUnrealizedPnl, liveEquity, totalMarginUsed } = useMemo(() => {
    const computedPositions = practiceData.positions.map(pos => {
      const currentAsset = assets.find(a => a.symbol === pos.symbol);
      const markPrice = currentAsset ? currentAsset.price : pos.currentPrice;
      const { pnl, pnlPercent } = tradingSimulatorService.calculatePnl(
        pos.side,
        pos.entryPrice,
        markPrice,
        pos.quantity
      );

      return {
        ...pos,
        currentPrice: markPrice,
        pnl,
        pnlPercent,
      };
    });

    const unPnl = computedPositions.reduce((sum, p) => sum + p.pnl, 0);
    const margin = computedPositions.reduce((sum, p) => sum + p.margin, 0);
    const eq = practiceData.account.balance + unPnl;

    return {
      positionsWithPnl: computedPositions,
      totalUnrealizedPnl: Number(unPnl.toFixed(2)),
      liveEquity: Number(eq.toFixed(2)),
      totalMarginUsed: Number(margin.toFixed(2)),
    };
  }, [practiceData.positions, practiceData.account.balance, assets]);

  // Filtered asset list
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesCategory =
        categoryFilter === "all" || asset.category === categoryFilter;
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [assets, categoryFilter, searchQuery]);

  // Order Ticket Calculations
  const numericQty = parseFloat(quantityInput) || 0;
  const notionalValue = Number((numericQty * selectedAsset.price).toFixed(2));
  const requiredMargin = Number((notionalValue / leverage).toFixed(2));
  const estimatedLiquidation = tradingSimulatorService.calculateLiquidationPrice(
    orderSide,
    selectedAsset.price,
    leverage
  );

  // Risk to Reward ratio
  const riskRewardRatio = useMemo(() => {
    const sl = parseFloat(stopLossInput);
    const tp = parseFloat(takeProfitInput);
    if (!sl || !tp || selectedAsset.price <= 0) return null;

    const risk =
      orderSide === "long" ? selectedAsset.price - sl : sl - selectedAsset.price;
    const reward =
      orderSide === "long" ? tp - selectedAsset.price : selectedAsset.price - tp;

    if (risk <= 0 || reward <= 0) return null;
    return (reward / risk).toFixed(2);
  }, [stopLossInput, takeProfitInput, selectedAsset.price, orderSide]);

  // Handle Order Placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderFeedback(null);

    if (numericQty <= 0) {
      setOrderFeedback("Please specify a valid trade quantity.");
      return;
    }

    const freeMarginAvailable = liveEquity - totalMarginUsed;
    if (requiredMargin > freeMarginAvailable) {
      setOrderFeedback(
        `Insufficient free margin. Required: $${requiredMargin.toLocaleString()}, Free: $${freeMarginAvailable.toLocaleString()}`
      );
      return;
    }

    const sl = stopLossInput ? parseFloat(stopLossInput) : undefined;
    const tp = takeProfitInput ? parseFloat(takeProfitInput) : undefined;

    const res = tradingSimulatorService.openPosition({
      account: {
        ...practiceData.account,
        equity: liveEquity,
        marginUsed: totalMarginUsed,
        freeMargin: freeMarginAvailable,
      },
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      category: selectedAsset.category,
      side: orderSide,
      leverage,
      quantity: numericQty,
      price: selectedAsset.price,
      stopLoss: sl,
      takeProfit: tp,
    });

    if (res.success && res.position) {
      const updatedPositions = [res.position, ...practiceData.positions];
      persistPracticeState({
        ...practiceData,
        positions: updatedPositions,
      });
      setOrderFeedback("Order executed successfully in demo account!");
      setTimeout(() => setOrderFeedback(null), 3500);
    } else {
      setOrderFeedback(res.error || "Order failed to execute.");
    }
  };

  // Handle Close Position
  const handleClosePosition = (positionId: string) => {
    const targetPos = positionsWithPnl.find(p => p.id === positionId);
    if (!targetPos) return;

    const { closedTrade, updatedAccount } = tradingSimulatorService.closePosition(
      targetPos,
      targetPos.currentPrice,
      practiceData.account,
      "manual"
    );

    const remainingPositions = practiceData.positions.filter(p => p.id !== positionId);
    const updatedClosedTrades = [closedTrade, ...practiceData.closedTrades];

    persistPracticeState({
      account: updatedAccount,
      positions: remainingPositions,
      closedTrades: updatedClosedTrades,
    });
  };

  // Handle Reset Demo Account
  const handleResetDemo = () => {
    const confirmReset = window.confirm(
      "Reset demo practice account back to $100,000 USD virtual capital?"
    );
    if (!confirmReset) return;

    persistPracticeState({
      account: {
        balance: INITIAL_DEMO_BALANCE,
        equity: INITIAL_DEMO_BALANCE,
        marginUsed: 0,
        freeMargin: INITIAL_DEMO_BALANCE,
        currency: "USD",
        initialBalance: INITIAL_DEMO_BALANCE,
      },
      positions: [],
      closedTrades: [],
    });
  };

  // Performance stats
  const performance = useMemo(() => {
    const trades = practiceData.closedTrades;
    if (!trades.length) {
      return { winRate: 0, totalTrades: 0, netPnl: 0, profitFactor: 0 };
    }

    const wins = trades.filter(t => t.realizedPnl > 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.realizedPnl, 0);
    const grossLoss = Math.abs(
      trades.filter(t => t.realizedPnl < 0).reduce((acc, t) => acc + t.realizedPnl, 0)
    );

    const winRate = (wins.length / trades.length) * 100;
    const netPnl = trades.reduce((acc, t) => acc + t.realizedPnl, 0);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;

    return {
      winRate: Number(winRate.toFixed(1)),
      totalTrades: trades.length,
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
    };
  }, [practiceData.closedTrades]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Trading Practice Simulator</h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 font-semibold">
              <Zap className="h-3 w-3" /> Exness CFD & Crypto Demo
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Master live order execution, CFD leverage (Long & Short), stop-losses, and liquidation risk management with zero financial downside.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Link href="/dashboard/learn">
              <BookOpen className="h-4 w-4" />
              Learner Academy & Playbook
            </Link>
          </Button>

          <Button
            onClick={handleResetDemo}
            variant="outline"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            title="Reset balance to $100,000"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo Account
          </Button>
        </div>
      </div>

      {/* Account KPI Header Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="shadow-xs p-4 bg-card/70 border-border/80">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Cash Balance
          </div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">
            ${practiceData.account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Realized Cash in Demo</div>
        </Card>

        <Card className="shadow-xs p-4 bg-card/70 border-border/80">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Net Equity
          </div>
          <div className="text-xl font-bold font-mono text-primary mt-1">
            ${liveEquity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Balance + Open P&L</div>
        </Card>

        <Card className="shadow-xs p-4 bg-card/70 border-border/80">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Unrealized P&L
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              totalUnrealizedPnl >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {totalUnrealizedPnl >= 0 ? "+" : ""}
            ${totalUnrealizedPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {positionsWithPnl.length} active position{positionsWithPnl.length === 1 ? "" : "s"}
          </div>
        </Card>

        <Card className="shadow-xs p-4 bg-card/70 border-border/80">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Margin Utilization
          </div>
          <div className="text-xl font-bold font-mono text-foreground mt-1">
            ${totalMarginUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Free: ${(liveEquity - totalMarginUsed).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
        </Card>

        <Card className="shadow-xs p-4 bg-card/70 border-border/80 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Practice Win Rate
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {performance.winRate}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {performance.totalTrades} closed trade{performance.totalTrades === 1 ? "" : "s"}
          </div>
        </Card>
      </div>

      {/* Main Terminal Grid: Markets + Chart + Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Asset Universe Selector (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm border-border/80 flex flex-col h-[560px]">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    categoryFilter === "all"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategoryFilter("crypto")}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    categoryFilter === "crypto"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  ⚡ Crypto
                </button>
                <button
                  onClick={() => setCategoryFilter("us_stock")}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    categoryFilter === "us_stock"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  🇺🇸 US
                </button>
                <button
                  onClick={() => setCategoryFilter("india_stock")}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    categoryFilter === "india_stock"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  🇮🇳 India
                </button>
              </div>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto divide-y">
              {filteredAssets.map(asset => {
                const isSelected = asset.symbol === selectedSymbol;
                const isUp = asset.changePercent >= 0;
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`w-full p-3 text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        {asset.symbol}
                        {asset.category === "crypto" && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-500/30 text-amber-500">
                            CFD
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {asset.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold">
                        {asset.currency === "INR" ? "₹" : "$"}
                        {asset.price.toLocaleString("en-US", {
                          minimumFractionDigits: asset.price > 10 ? 2 : 4,
                        })}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-medium flex items-center justify-end gap-0.5 ${
                          isUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {isUp ? "+" : ""}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Center Column: Live Chart & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm border-border/80 h-[560px] flex flex-col">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">{selectedAsset.symbol}</CardTitle>
                    <span className="text-xs text-muted-foreground">{selectedAsset.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-foreground">
                      {selectedAsset.currency === "INR" ? "₹" : "$"}
                      {selectedAsset.price.toLocaleString("en-US", {
                        minimumFractionDigits: selectedAsset.price > 10 ? 2 : 4,
                      })}
                    </span>
                    <Badge
                      className={`text-xs ${
                        selectedAsset.changePercent >= 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      }`}
                      variant="outline"
                    >
                      {selectedAsset.changePercent >= 0 ? "+" : ""}
                      {selectedAsset.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>

                <div className="text-right text-xs text-muted-foreground space-y-1">
                  <div>
                    Max Leverage:{" "}
                    <span className="font-semibold text-primary">{selectedAsset.maxLeverage}x</span>
                  </div>
                  <div>Category: <span className="capitalize">{selectedAsset.category.replace("_", " ")}</span></div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between pt-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="practicePriceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis
                      domain={["auto", "auto"]}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={v => `${v}`}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [
                        `${selectedAsset.currency === "INR" ? "₹" : "$"}${Number(val).toLocaleString()}`,
                        "Price",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#practicePriceGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Asset Fundamentals / Practice Tips */}
              <div className="p-3 bg-muted/30 rounded-lg border border-border/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Trading Execution Note
                </div>
                <p className="text-muted-foreground">
                  {selectedAsset.category === "crypto"
                    ? "Crypto CFDs trade 24/7 with high volatility. Use disciplined stop-loss orders and keep leverage below 10x to prevent sudden liquidations."
                    : selectedAsset.category === "india_stock"
                    ? "NSE Equities trade Monday to Friday (9:15 AM - 3:30 PM IST). Ideal for swing trading and fundamental compounding."
                    : "US Equities feature deep liquidity and tight spreads. Pay attention to pre-market earnings catalysts and interest rate decisions."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Placement Ticket (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-sm border-border/80 h-[560px] flex flex-col justify-between">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Order Placement Ticket</span>
                <Badge variant="secondary" className="text-[10px]">
                  Virtual Execution
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* BUY / SELL Switch Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderSide("long")}
                    className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      orderSide === "long"
                        ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/40"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    BUY / LONG
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderSide("short")}
                    className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      orderSide === "short"
                        ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/40"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <TrendingDown className="h-4 w-4" />
                    SELL / SHORT
                  </button>
                </div>

                {/* Leverage Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">Demo Leverage (Exness style)</span>
                    <span className="font-mono font-bold text-primary">{leverage}x</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 5, 10, 20].map(lev => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => setLeverage(lev)}
                        className={`flex-1 py-1 text-xs font-mono rounded border transition-colors ${
                          leverage === lev
                            ? "bg-primary text-primary-foreground border-primary font-bold"
                            : "bg-background hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                  {leverage >= 10 && (
                    <div className="text-[10px] text-amber-500 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      High leverage amplifies gains and losses. Liquidation threshold is tight.
                    </div>
                  )}
                </div>

                {/* Trade Quantity Input */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">Trade Quantity</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Notional: ${notionalValue.toLocaleString()}
                    </span>
                  </div>
                  <Input
                    type="number"
                    step="any"
                    value={quantityInput}
                    onChange={e => setQuantityInput(e.target.value)}
                    required
                    className="font-mono text-sm"
                  />
                </div>

                {/* Stop Loss & Take Profit */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Stop-Loss ($)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. SL price"
                      value={stopLossInput}
                      onChange={e => setStopLossInput(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Take-Profit ($)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. TP price"
                      value={takeProfitInput}
                      onChange={e => setTakeProfitInput(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Risk to Reward Feedback */}
                {riskRewardRatio && (
                  <div className="flex justify-between text-xs p-2 rounded bg-muted/40 border">
                    <span className="text-muted-foreground">Risk-to-Reward (R:R):</span>
                    <span className="font-mono font-bold text-primary">1 : {riskRewardRatio}</span>
                  </div>
                )}

                {/* Margin & Liquidation Calculation */}
                <div className="p-3 bg-muted/20 rounded-lg border border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Required Margin:</span>
                    <span className="font-mono font-semibold">${requiredMargin.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Liquidation Price:</span>
                    <span className="font-mono font-semibold text-rose-500">
                      ${estimatedLiquidation.toLocaleString()}
                    </span>
                  </div>
                </div>

                {orderFeedback && (
                  <div
                    className={`text-xs p-2 rounded ${
                      orderFeedback.includes("success")
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {orderFeedback}
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full py-2.5 font-bold text-xs ${
                    orderSide === "long"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  Place {orderSide.toUpperCase()} Order ({leverage}x)
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Positions & History Ledger */}
      <Card className="shadow-sm">
        <div className="border-b p-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("positions")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "positions"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Open Positions ({positionsWithPnl.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Trade Journal & History ({practiceData.closedTrades.length})
            </button>
          </div>

          <div className="text-xs text-muted-foreground hidden sm:block">
            Positions auto-update with real-time mark prices.
          </div>
        </div>

        {/* OPEN POSITIONS TABLE */}
        {activeTab === "positions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="py-3 px-4 text-left">Asset</th>
                  <th className="py-3 px-4 text-center">Type / Side</th>
                  <th className="py-3 px-4 text-center">Leverage</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Entry Price</th>
                  <th className="py-3 px-4 text-right">Mark Price</th>
                  <th className="py-3 px-4 text-right">Margin</th>
                  <th className="py-3 px-4 text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {positionsWithPnl.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">No open positions</p>
                      <p className="text-xs mt-0.5">
                        Select an asset above and place a BUY or SELL order to practice.
                      </p>
                    </td>
                  </tr>
                ) : (
                  positionsWithPnl.map(pos => {
                    const isProfit = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{pos.symbol}</div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                            {pos.name}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              pos.side === "long"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            }`}
                            variant="outline"
                          >
                            {pos.side}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {pos.leverage}x
                        </td>

                        <td className="py-3 px-4 text-right font-mono">{pos.quantity}</td>

                        <td className="py-3 px-4 text-right font-mono">
                          ${pos.entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          ${pos.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          ${pos.margin.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={
                              isProfit
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }
                          >
                            {isProfit ? "+" : ""}${pos.pnl.toLocaleString()} ({isProfit ? "+" : ""}
                            {pos.pnlPercent.toFixed(2)}%)
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <Button
                            onClick={() => handleClosePosition(pos.id)}
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] hover:bg-rose-500/10 hover:text-rose-500"
                          >
                            Close Position
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TRADE JOURNAL & HISTORY TABLE */}
        {activeTab === "history" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="py-3 px-4 text-left">Asset</th>
                  <th className="py-3 px-4 text-center">Side</th>
                  <th className="py-3 px-4 text-center">Leverage</th>
                  <th className="py-3 px-4 text-right">Entry Price</th>
                  <th className="py-3 px-4 text-right">Exit Price</th>
                  <th className="py-3 px-4 text-right">Realized P&L</th>
                  <th className="py-3 px-4 text-center">Exit Trigger</th>
                  <th className="py-3 px-4 text-right">Closed At</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {practiceData.closedTrades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      No closed trades recorded yet.
                    </td>
                  </tr>
                ) : (
                  practiceData.closedTrades.map(trade => {
                    const isWin = trade.realizedPnl >= 0;
                    return (
                      <tr key={trade.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-semibold">{trade.symbol}</td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-semibold uppercase text-[10px] ${
                              trade.side === "long" ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {trade.side}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono">{trade.leverage}x</td>

                        <td className="py-3 px-4 text-right font-mono">${trade.entryPrice.toLocaleString()}</td>

                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          ${trade.exitPrice.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={
                              isWin
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }
                          >
                            {isWin ? "+" : ""}${trade.realizedPnl.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center capitalize">
                          <Badge variant="outline" className="text-[10px]">
                            {trade.closeReason.replace("_", " ")}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {new Date(trade.closedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
