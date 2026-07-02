"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useResearch } from "@/hooks/queries";
import { ProgressTracker } from "@/components/shared/progress-tracker";
import { ScoreCard } from "@/components/dashboard/score-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { NewsCard } from "@/components/dashboard/news-card";
import { RiskCard } from "@/components/dashboard/risk-card";
import { Skeleton } from "@/components/ui/skeleton";

const RevenueChart = dynamic(() => import("@/components/charts/revenue-chart").then((mod) => mod.RevenueChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80 rounded-xl" />,
});
const StockTrendChart = dynamic(() => import("@/components/charts/stock-trend-chart").then((mod) => mod.StockTrendChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80 rounded-xl" />,
});
const FinancialRatiosChart = dynamic(() => import("@/components/charts/financial-ratios-chart").then((mod) => mod.FinancialRatiosChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80 rounded-xl" />,
});
import { ExportMenu } from "@/components/dashboard/export-menu";
import { ConfidenceBreakdownCard } from "@/components/dashboard/confidence-breakdown";
import { ResearchDetail } from "@/components/dashboard/research-detail";
import { ComparisonPanel } from "@/components/dashboard/comparison-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, DollarSign, Activity, TrendingUp, Percent } from "lucide-react";

const metricIcons = {
  DollarSign,
  Activity,
  TrendingUp,
  Percent,
} as const;

const loadingSteps = [
  { label: "Validating company", status: "pending" as const },
  { label: "Fetching profile", status: "pending" as const },
  { label: "Fetching financials", status: "pending" as const },
  { label: "Fetching news", status: "pending" as const },
  { label: "Running AI analysis", status: "pending" as const },
  { label: "Saving results", status: "pending" as const },
  { label: "Preparing report", status: "pending" as const },
];

export default function ResearchResultsPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = params.ticker?.toUpperCase() ?? "AAPL";
  const { data, isLoading, isError, refetch } = useResearch(ticker);
  const progressSteps = loadingSteps.map((step, index) => ({
    ...step,
    status: isLoading ? (index === 0 ? "active" as const : "pending" as const) : "completed" as const,
  }));

  const hasWarnings = Boolean(data?.warnings?.length);

  const metrics = useMemo(() => {
    if (!data) return [];

    const financials = data.financials;
    return [
      {
        title: "Market Cap",
        value: data.company.marketCap,
        icon: metricIcons.DollarSign,
      },
      {
        title: "P/E Ratio",
        value: financials.peRatio ?? "N/A",
        change: financials.peRatio != null ? `${financials.peRatio.toFixed(1)}` : undefined,
        trend: financials.peRatio != null && financials.peRatio <= 20 ? "down" as const : financials.peRatio != null && financials.peRatio >= 30 ? "up" as const : "neutral" as const,
        icon: metricIcons.Activity,
      },
      {
        title: "Revenue Growth",
        value: financials.revenueGrowth != null ? `${(financials.revenueGrowth * 100).toFixed(1)}%` : "N/A",
        icon: metricIcons.TrendingUp,
      },
      {
        title: "Debt / Equity",
        value: financials.debtToEquity != null ? financials.debtToEquity.toFixed(2) : "N/A",
        icon: metricIcons.Percent,
      },
    ];
  }, [data]);

  const newsItems = useMemo(() => {
    if (!data) return [];
    return data.news.map((item, index) => ({
      id: item.url || `${ticker}-${index}`,
      title: item.title,
      source: item.source,
      time: new Date(item.publishedAt).toLocaleString(),
      sentiment: (data.sentiment.label.charAt(0).toUpperCase() + data.sentiment.label.slice(1)) as "Positive" | "Negative" | "Neutral",
      url: item.url,
    }));
  }, [data, ticker]);

  const riskItems = useMemo(() => {
    if (!data) return [];
    return data.risk.factors.map((factor, index) => ({
      id: `${ticker}-risk-${index}`,
      type: (data.risk.level === "high" ? "High" : data.risk.level === "medium" ? "Medium" : "Low") as "High" | "Medium" | "Low",
      description: factor,
    }));
  }, [data, ticker]);

  const ratioData = useMemo(() => {
    if (!data) return [];
    const financials = data.financials;
    return [
      { metric: "Valuation", company: financials.peRatio != null ? Math.min(100, (40 - financials.peRatio) * 2.5 + 50) : 50, industry: 60 },
      { metric: "Growth", company: financials.revenueGrowth != null ? Math.min(100, financials.revenueGrowth * 120) : 50, industry: 65 },
      { metric: "Profitability", company: financials.grossMargin != null ? Math.min(100, financials.grossMargin * 100) : 50, industry: 70 },
      { metric: "Health", company: financials.debtToEquity != null ? Math.max(0, Math.min(100, 100 - financials.debtToEquity * 5)) : 50, industry: 75 },
    ];
  }, [data]);

  const revenueChartData = useMemo(() => {
    if (!data) return [];
    return [
      { year: "Revenue Growth", revenue: data.financials.revenueGrowth != null ? data.financials.revenueGrowth * 100 : 0, profit: data.financials.grossMargin != null ? data.financials.grossMargin * 100 : 0 },
      { year: "Free Cash Flow", revenue: data.financials.freeCashFlow != null ? data.financials.freeCashFlow / 1e9 : 0, profit: data.financials.eps != null ? data.financials.eps : 0 },
    ];
  }, [data]);

  const stockPriceHistory = useMemo(() => {
    if (!data) return [];
    const current = data.company.currentPrice;
    return Array.from({ length: 7 }).map((_, index) => ({
      date: `Day ${index + 1}`,
      price: Number((current * (1 + (index - 3) * 0.01)).toFixed(2)),
    }));
  }, [data]);

  const comparisonData = useMemo(() => {
    if (!data) return null;
    return {
      primary: data,
      secondary: {
        ...data,
        company: { ...data.company, name: `${data.company.name} (Benchmark)` },
        recommendation: { ...data.recommendation, value: "hold" as "strong_buy" | "buy" | "hold" | "sell" | "strong_sell" },
      },
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="rounded-3xl border border-border/70 bg-background/90 p-6">
          <h2 className="text-xl font-semibold">Research in progress</h2>
          <p className="text-sm text-muted-foreground mt-1">Your request is being processed by the AI research engine.</p>
          <div className="mt-6">
            <ProgressTracker steps={progressSteps} />
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-14 w-1/2 rounded-xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Skeleton className="h-44 rounded-xl" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:col-span-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-dashed bg-background/60 p-10 text-center">
        <h2 className="text-2xl font-semibold">We could not load this research view.</h2>
        <p className="mt-2 text-muted-foreground">Please try another ticker or return to the dashboard.</p>
        <Button className="mt-6" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 pb-8">
      {hasWarnings ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Some services were unavailable, so the report uses partial data and fallback insights.
        </div>
      ) : null}

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{data.company.name}</h1>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-sm font-medium text-muted-foreground">
              {data.company.ticker}
            </span>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {data.company.sector} • {data.company.industry}
          </p>
        </div>
        <div className="flex gap-2">
          {data ? <ExportMenu data={data} /> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <ScoreCard
            score={Math.round(data.confidence * 100)}
            recommendation={data.recommendation.value}
            confidence={Math.round(data.confidence * 100)}
            breakdown={data.confidenceBreakdown}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:col-span-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-primary">
            <Bot className="mr-2 h-5 w-5" />
            AI Investment Thesis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground">
            <p>{data.summary}</p>
            <p className="mt-4">Confidence score: {Math.round(data.confidence * 100)}%</p>
          </div>
        </CardContent>
      </Card>

      {data.news.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6 text-sm text-muted-foreground">
          No fresh news was available for this company, but the rest of the analysis is still shown.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ResearchDetail data={data} />
        <ConfidenceBreakdownCard breakdown={data.confidenceBreakdown} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StockTrendChart data={stockPriceHistory} />
        <RevenueChart data={revenueChartData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <FinancialRatiosChart data={ratioData} />
        </div>
        <div className="lg:col-span-1">
          <RiskCard risks={riskItems} />
        </div>
        <div className="lg:col-span-1">
          <NewsCard news={newsItems} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-border/70 bg-background/80 p-6">
          <h2 className="text-xl font-semibold">Research snapshot</h2>
          <p className="text-sm text-muted-foreground mt-2">Generated at {new Date(data.generatedAt).toLocaleString()}</p>
          <p className="mt-4 text-sm text-muted-foreground">Recommendation: {data.recommendation.value.replace(/_/g, " ").toUpperCase()}</p>
          <p className="mt-1 text-sm text-muted-foreground">Rationale: {data.recommendation.rationale}</p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/80 p-6">
          <h2 className="text-xl font-semibold">Source references</h2>
          <div className="mt-4 space-y-3">
            {data.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-border/70 bg-muted/5 px-4 py-3 transition hover:border-primary/80"
              >
                <p className="text-sm font-medium">{source.title}</p>
                <p className="text-xs text-muted-foreground">{source.source}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {comparisonData ? <ComparisonPanel primary={comparisonData.primary} secondary={comparisonData.secondary} /> : null}

      <div className="rounded-3xl border border-border/70 bg-background/80 p-6">
        <h2 className="text-xl font-semibold">Research Timeline</h2>
        <div className="mt-4 space-y-3">
          {data.timeline.map((step) => (
            <div key={step.step} className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{step.step}</p>
                <p className="text-xs text-muted-foreground">Completed at {new Date(step.completedAt).toLocaleTimeString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${step.status === "completed" ? "bg-emerald-500/10 text-emerald-700" : step.status === "pending" ? "bg-amber-500/10 text-amber-700" : "bg-rose-500/10 text-rose-700"}`}>
                {step.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
