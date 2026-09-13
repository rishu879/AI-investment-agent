"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Calculator,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Zap,
  BookOpen,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Lock,
  Layers,
  Award,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LessonModule {
  id: string;
  number: number;
  title: string;
  category: "Basics" | "Risk Management" | "Technical Analysis" | "Crypto & Leverage" | "Real-Life Blueprint";
  duration: string;
  summary: string;
  keyTakeaways: string[];
  realLifeAction: string;
}

const MODULES: LessonModule[] = [
  {
    id: "mod-1",
    number: 1,
    title: "Market Mechanics: Order Books & Execution",
    category: "Basics",
    duration: "10 mins",
    summary:
      "Understand how market liquidity works. Learn the difference between aggressive Market Orders and passive Limit Orders, how the Bid/Ask spread affects entry costs, and how to avoid slippage.",
    keyTakeaways: [
      "Market orders prioritize speed over price; Limit orders guarantee price but not execution.",
      "The spread is the fee you pay to market makers; wide spreads in illiquid assets erode edge.",
      "Always check volume before trading small-cap equities or meme tokens.",
    ],
    realLifeAction:
      "When trading real capital, use Limit orders during high volatility (e.g. earnings announcements or CPI releases) to avoid slippage.",
  },
  {
    id: "mod-2",
    number: 2,
    title: "The 1% Risk Management Rule & Asymmetric Returns",
    category: "Risk Management",
    duration: "15 mins",
    summary:
      "The single most important skill of professional fund managers is capital preservation. Learn why you should never risk more than 1% to 2% of total capital on any single trade.",
    keyTakeaways: [
      "If you lose 50% of your account, you need a 100% gain just to break even.",
      "Target minimum 1:2 or 1:3 Risk-to-Reward (R:R). Even with a 40% win rate, you will be highly profitable.",
      "Calculate your stop-loss distance FIRST, then determine your position size—never the reverse.",
    ],
    realLifeAction:
      "Use the interactive Position Sizer below before entering any real trade to ensure your dollar risk is locked at exactly 1%.",
  },
  {
    id: "mod-3",
    number: 3,
    title: "High-Probability Technical Setups & Indicators",
    category: "Technical Analysis",
    duration: "15 mins",
    summary:
      "Move beyond noise and identify clean market structure. Learn how to combine Moving Average trend filters (20, 50, 200 EMA) with RSI divergence and support/resistance breakout retests.",
    keyTakeaways: [
      "Trade in the direction of the dominant trend: only take long trades when price is above the 50 & 200 EMA.",
      "Wait for the retest: 70% of breakouts retest prior resistance as new support before continuing.",
      "RSI divergence (price making lower lows while RSI makes higher lows) signals institutional accumulation.",
    ],
    realLifeAction:
      "Open the Technical & AI Predictor tab in this platform to check indicator confluence before opening your trade.",
  },
  {
    id: "mod-4",
    number: 4,
    title: "Crypto & CFD Leverage: Surviving Volatility (Exness & Binance)",
    category: "Crypto & Leverage",
    duration: "12 mins",
    summary:
      "Leverage is a double-edged sword. Understand how margin borrowing works, how liquidation prices are calculated, and why excessive leverage (10x-50x) guarantees account wipeout.",
    keyTakeaways: [
      "Leverage does not increase your edge; it only compresses your margin of error.",
      "A 10x leveraged long position is liquidated if the asset drops by just ~8.5%.",
      "Crypto markets trade 24/7 without circuit breakers. Mandatory stop-losses are non-negotiable.",
    ],
    realLifeAction:
      "Never use more than 2x to 5x leverage when starting with real funds, regardless of what CFD brokers offer.",
  },
  {
    id: "mod-5",
    number: 5,
    title: "Real-Life Implementation Blueprint & Broker Setup",
    category: "Real-Life Blueprint",
    duration: "20 mins",
    summary:
      "Step-by-step roadmap to graduate from paper trading to live markets with real money. Broker selection, KYC onboarding, tax compliance, and psychological discipline.",
    keyTakeaways: [
      "Phase 1: 30 days paper trading with a verified positive profit factor (>1.5).",
      "Phase 2: Deposit micro capital ($500 to $1,000) to acclimate to real emotional pressure.",
      "Maintain a written trading journal tracking win rate, emotion state, and execution mistakes.",
    ],
    realLifeAction:
      "Select a regulated broker with low commissions and strict fund segregation (e.g. Zerodha/Groww in India, Interactive Brokers in US/Global, Exness for CFDs).",
  },
];

export default function LearnPage() {
  const [selectedModule, setSelectedModule] = useState<LessonModule>(MODULES[0]);

  // Position Sizing Calculator State
  const [calcCapital, setCalcCapital] = useState<number>(10000);
  const [calcRiskPercent, setCalcRiskPercent] = useState<number>(1.5);
  const [calcEntryPrice, setCalcEntryPrice] = useState<number>(150);
  const [calcStopLoss, setCalcStopLoss] = useState<number>(142);

  // Real-Life Readiness Checklist
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    rules: true,
    risk: true,
    paper: true,
    journal: false,
    broker: false,
  });

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistCount = Object.values(checklist).filter(Boolean).length;

  // Position Sizing Math
  const sizingResult = useMemo(() => {
    const capital = calcCapital || 1;
    const riskPct = calcRiskPercent || 1;
    const entry = calcEntryPrice || 1;
    const sl = calcStopLoss || 1;

    const dollarRisk = (capital * riskPct) / 100;
    const perShareRisk = Math.abs(entry - sl);

    if (perShareRisk <= 0) {
      return {
        dollarRisk,
        perShareRisk: 0,
        sharesToBuy: 0,
        totalPositionValue: 0,
        percentOfCapital: 0,
      };
    }

    const sharesToBuy = Math.floor(dollarRisk / perShareRisk);
    const totalPositionValue = Number((sharesToBuy * entry).toFixed(2));
    const percentOfCapital = Number(((totalPositionValue / capital) * 100).toFixed(1));

    return {
      dollarRisk: Number(dollarRisk.toFixed(2)),
      perShareRisk: Number(perShareRisk.toFixed(2)),
      sharesToBuy,
      totalPositionValue,
      percentOfCapital,
    };
  }, [calcCapital, calcRiskPercent, calcEntryPrice, calcStopLoss]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Learner Portfolio & Academy</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 gap-1 font-semibold">
              <GraduationCap className="h-3.5 w-3.5" /> Paper-to-Real Transition
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Learn institutional trading discipline, calculate mathematical position sizes, and build an actionable roadmap for real-world markets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Link href="/dashboard/trading-practice">
              <Zap className="h-4 w-4" />
              Practice in Demo Terminal
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid: Curriculum Tabs + Lesson Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Module List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Curriculum Roadmap
          </div>
          <div className="space-y-2">
            {MODULES.map(mod => {
              const isSelected = mod.id === selectedModule.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-card/60 hover:bg-card border-border/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      Module {mod.number}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{mod.duration}</span>
                  </div>
                  <div className="font-semibold text-sm text-foreground">{mod.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{mod.summary}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Lesson Deep Dive (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-border/80">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                  {selectedModule.category}
                </Badge>
                <span className="text-xs text-muted-foreground">Estimated read: {selectedModule.duration}</span>
              </div>
              <CardTitle className="text-xl font-bold mt-2">{selectedModule.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{selectedModule.summary}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Key Takeaways */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Key Institutional Rules
                </h3>
                <div className="space-y-2.5">
                  {selectedModule.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/60">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm leading-relaxed text-foreground">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Life Execution Directive */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Compass className="h-4 w-4" />
                  How to Implement in Real Life
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {selectedModule.realLifeAction}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Tool: Position Sizing & Risk Calculator */}
      <Card className="shadow-sm border-primary/20 bg-card/70">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Interactive Position Size & Risk Calculator</CardTitle>
          </div>
          <CardDescription>
            Never guess how many shares or crypto units to trade. Enter your capital and stop-loss to calculate exact position sizing based on strict mathematical risk.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Total Trading Capital ($)
              </label>
              <Input
                type="number"
                value={calcCapital}
                onChange={e => setCalcCapital(Number(e.target.value) || 0)}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Max Risk per Trade (%)
              </label>
              <Input
                type="number"
                step={0.1}
                value={calcRiskPercent}
                onChange={e => setCalcRiskPercent(Number(e.target.value) || 0)}
                className="font-mono text-sm"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Recommended: 1.0% - 2.0%
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Planned Entry Price ($)
              </label>
              <Input
                type="number"
                step="any"
                value={calcEntryPrice}
                onChange={e => setCalcEntryPrice(Number(e.target.value) || 0)}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Stop-Loss Price ($)
              </label>
              <Input
                type="number"
                step="any"
                value={calcStopLoss}
                onChange={e => setCalcStopLoss(Number(e.target.value) || 0)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Sizing Output Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="text-[11px] font-semibold uppercase text-rose-500">Max Dollar Risk</div>
              <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                ${sizingResult.dollarRisk.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Fixed loss if SL hit</div>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <div className="text-[11px] font-semibold uppercase text-primary">Allowed Quantity</div>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {sizingResult.sharesToBuy.toLocaleString()} Units
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Exact contracts / shares</div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-center">
              <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                Total Position Value
              </div>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                ${sizingResult.totalPositionValue.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Capital deployed</div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-center">
              <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                Account Exposure
              </div>
              <div className="text-2xl font-bold font-mono text-foreground mt-1">
                {sizingResult.percentOfCapital}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">% of total portfolio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Life Graduation Checklist & Broker Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Checklist (6 cols) */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Real-Money Readiness Checklist
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-mono">
                {checklistCount} / 5 Checked
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Complete these milestones before risking personal funds in live markets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                id: "rules",
                label: "I strictly follow the 1-2% maximum loss per trade rule.",
                sub: "No single losing trade can threaten portfolio longevity.",
              },
              {
                id: "risk",
                label: "I place hard stop-losses on 100% of open positions.",
                sub: "No mental stop-losses or emotional hesitation.",
              },
              {
                id: "paper",
                label: "I have practiced in the Demo Simulator for at least 30 trades.",
                sub: "Achieved a verified positive win rate and profit factor.",
              },
              {
                id: "journal",
                label: "I keep a trading journal recording entry reasons and exit notes.",
                sub: "Systematic review of execution quality and mistakes.",
              },
              {
                id: "broker",
                label: "I have verified KYC and fees with a regulated broker.",
                sub: "Understood withdrawal limits, spreads, and overnight rollover rates.",
              },
            ].map(item => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                  checklist[item.id]
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-card hover:bg-muted/40 border-border/70"
                }`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border ${
                    checklist[item.id]
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-muted-foreground"
                  }`}
                >
                  {checklist[item.id] && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.sub}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Broker Roadmap & Real Execution Guide (6 cols) */}
        <Card className="lg:col-span-6 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Verified Broker Recommendations
            </CardTitle>
            <CardDescription className="text-xs">
              Selecting the appropriate platform for your jurisdiction and asset class.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">🇮🇳 India (NSE & BSE Equities)</span>
                <Badge variant="outline" className="text-[9px]">Zero Delivery Brokerage</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Recommended:</strong> Zerodha, Groww, Angel One. Highly liquid, SEBI-regulated, ideal for long-term equity compounding and options.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">🇺🇸 US & Global Stocks</span>
                <Badge variant="outline" className="text-[9px]">Direct SEC Custody</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Recommended:</strong> Interactive Brokers, Robinhood, Charles Schwab. Low fractional shares, deep pre-market liquidity, low margin interest.
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">⚡ Crypto & Forex CFDs (Exness Style)</span>
                <Badge variant="outline" className="text-[9px]">24/7 Liquidity</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Recommended:</strong> Exness (CFDs & Gold), Binance / Bybit (Spot & Perpetual Crypto Futures). Strict leverage discipline required.
              </p>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full gap-2 text-xs font-semibold">
                <Link href="/dashboard/trading-practice">
                  Start Practicing with $100k Virtual Balance
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
