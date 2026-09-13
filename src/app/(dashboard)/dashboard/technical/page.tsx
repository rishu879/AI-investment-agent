"use client";

import { useState } from "react";
import Link from "next/link";
import { useTechnicalAnalysis } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Zap,
  ShieldAlert,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Layers,
} from "lucide-react";

export default function TechnicalPage() {
  const [queryInput, setQueryInput] = useState("AAPL");
  const [activeTicker, setActiveTicker] = useState("AAPL");

  const { data, isLoading, isError, refetch } = useTechnicalAnalysis(activeTicker);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      setActiveTicker(queryInput.trim().toUpperCase());
    }
  };

  const isBullish = data?.direction === "bullish";
  const isBearish = data?.direction === "bearish";

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Zap className="h-3.5 w-3.5" />
            Quantitative Technical & ML Forecasting
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Technical & AI Predictor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Algorithmic RSI, MACD, Bollinger Bands, Moving Average Crosses & Gemini directional predictions.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
          <Input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Enter ticker (e.g. AAPL, NVDA, TCS.NS)"
            className="font-mono uppercase"
          />
          <Button type="submit" className="gap-1.5 shrink-0">
            <Search className="h-4 w-4" /> Analyze
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <Card className="p-8 text-center border-dashed">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Unable to generate technical analysis for {activeTicker}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Please ensure the ticker symbol is valid (e.g. AAPL, MSFT, TSLA, RELIANCE.NS).
          </p>
          <Button onClick={() => setActiveTicker("AAPL")}>Reset to AAPL</Button>
        </Card>
      ) : (
        <>
          {/* Top Prediction & Signal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* AI Direction Card */}
            <Card className="border-border/80 shadow-sm relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isBullish ? "bg-emerald-500" : isBearish ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                  AI Trend Forecast (7-14 Days)
                </CardDescription>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold uppercase flex items-center gap-2">
                    {data.direction}
                    {isBullish ? (
                      <ArrowUpRight className="h-6 w-6 text-emerald-500" />
                    ) : isBearish ? (
                      <ArrowDownRight className="h-6 w-6 text-rose-500" />
                    ) : (
                      <Compass className="h-6 w-6 text-amber-500" />
                    )}
                  </CardTitle>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary">
                    {data.confidenceScore}% Confidence
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">Target Range:</span>
                  <span className="font-mono font-semibold">
                    ${data.predictedRange.low} - ${data.predictedRange.high}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">Est. Projection:</span>
                  <span
                    className={`font-mono font-bold ${
                      data.predictedRange.potentialReturnPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                    }`}
                  >
                    {data.predictedRange.potentialReturnPercent >= 0 ? "+" : ""}
                    {data.predictedRange.potentialReturnPercent}% (${data.predictedRange.target})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t leading-relaxed">
                  {data.verdictSummary}
                </p>
              </CardContent>
            </Card>

            {/* Moving Average Alignment */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                  Moving Average Structure
                </CardDescription>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>{data.technicalSummary.movingAverages.trend.replace("_", " ").toUpperCase()}</span>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    Price: ${data.currentPrice}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">EMA 20 (Short):</span>
                  <span className="font-mono font-medium">${data.technicalSummary.movingAverages.ema20}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">EMA 50 (Medium):</span>
                  <span className="font-mono font-medium">${data.technicalSummary.movingAverages.ema50}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">EMA 200 (Long):</span>
                  <span className="font-mono font-medium">${data.technicalSummary.movingAverages.ema200}</span>
                </div>
                {data.technicalSummary.movingAverages.isGoldenCross && (
                  <div className="mt-2 p-1.5 rounded bg-emerald-500/10 text-emerald-600 text-center font-semibold">
                    ★ Active Golden Cross
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Momentum & Oscillators */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                  Momentum & Oscillators
                </CardDescription>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>RSI: {data.technicalSummary.rsi.value.toFixed(1)}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                      data.technicalSummary.rsi.signal === "oversold"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : data.technicalSummary.rsi.signal === "overbought"
                        ? "bg-rose-500/15 text-rose-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {data.technicalSummary.rsi.signal}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">MACD Histogram:</span>
                  <span
                    className={`font-mono font-semibold ${
                      data.technicalSummary.macd.histogram >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {data.technicalSummary.macd.histogram >= 0 ? "+" : ""}
                    {data.technicalSummary.macd.histogram}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Bollinger Bandwidth:</span>
                  <span className="font-mono font-medium">{data.technicalSummary.bollingerBands.bandwidth}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Volatility Regime:</span>
                  <span className="font-semibold uppercase">{data.mlSignals.volatilityRegime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Price Chart with Technical Overlays */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> {activeTicker} Daily Price & Moving Averages
                </CardTitle>
                <CardDescription>
                  Interactive price action with EMA 20 (Cyan) and EMA 50 (Purple) trajectory.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Price
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" /> EMA 20
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.technicalSummary.candles}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={8} />
                    <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                      name="Close Price"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Support / Resistance Levels & Technical Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pivot Support / Resistance */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Pivot Support & Resistance Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">
                  <span>Resistance 2 (R2)</span>
                  <span>${data.technicalSummary.keyLevels.resistance2}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-rose-500/5 text-rose-600 dark:text-rose-300">
                  <span>Resistance 1 (R1)</span>
                  <span>${data.technicalSummary.keyLevels.resistance1}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted font-bold">
                  <span>Central Pivot (P)</span>
                  <span>${data.technicalSummary.keyLevels.pivot}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-emerald-500/5 text-emerald-600 dark:text-emerald-300">
                  <span>Support 1 (S1)</span>
                  <span>${data.technicalSummary.keyLevels.support1}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <span>Support 2 (S2)</span>
                  <span>${data.technicalSummary.keyLevels.support2}</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Algorithmic Signals */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> Detected Technical Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.technicalSummary.signals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No extreme breakout or divergence signals active today.</p>
                ) : (
                  data.technicalSummary.signals.map((sig, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                        sig.type === "bullish"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
                          : sig.type === "bearish"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200"
                          : "bg-muted border-border text-foreground"
                      }`}
                    >
                      <div className="font-bold shrink-0">{sig.name}:</div>
                      <div className="text-muted-foreground dark:text-inherit leading-snug">{sig.description}</div>
                    </div>
                  ))
                )}

                <div className="pt-3 border-t flex justify-end">
                  <Button size="sm" asChild variant="outline">
                    <Link href={`/dashboard/research/${activeTicker}`}>
                      Full Fundamental Research Report →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
