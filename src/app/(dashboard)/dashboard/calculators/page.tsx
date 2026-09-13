"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Coins,
  CreditCard,
  TrendingUp,
  Percent,
  Wallet,
  Clock,
  PiggyBank,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { calculatorService } from "@/services/calculator-service";

type CalculatorTab = "sip" | "emi" | "cagr" | "compound" | "swp" | "retirement";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground) / 0.35)"];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("sip");

  // SIP State
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipRate, setSipRate] = useState<number>(12);
  const [sipYears, setSipYears] = useState<number>(10);

  // EMI State
  const [emiPrincipal, setEmiPrincipal] = useState<number>(3000000);
  const [emiRate, setEmiRate] = useState<number>(8.5);
  const [emiYears, setEmiYears] = useState<number>(20);

  // CAGR State
  const [cagrInitial, setCagrInitial] = useState<number>(100000);
  const [cagrFinal, setCagrFinal] = useState<number>(350000);
  const [cagrYears, setCagrYears] = useState<number>(5);

  // Compound Interest State
  const [ciPrincipal, setCiPrincipal] = useState<number>(500000);
  const [ciRate, setCiRate] = useState<number>(9);
  const [ciYears, setCiYears] = useState<number>(8);
  const [ciFreq, setCiFreq] = useState<"annual" | "semiannual" | "quarterly" | "monthly">("annual");

  // SWP State
  const [swpInitial, setSwpInitial] = useState<number>(5000000);
  const [swpMonthly, setSwpMonthly] = useState<number>(35000);
  const [swpRate, setSwpRate] = useState<number>(9);
  const [swpYears, setSwpYears] = useState<number>(15);

  // Retirement State
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(50000);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [preReturn, setPreReturn] = useState<number>(12);
  const [postReturn, setPostReturn] = useState<number>(8);

  // Calculated Results
  const sipResult = useMemo(
    () => calculatorService.calculateSip(sipMonthly, sipRate, sipYears),
    [sipMonthly, sipRate, sipYears]
  );

  const emiResult = useMemo(
    () => calculatorService.calculateEmi(emiPrincipal, emiRate, emiYears),
    [emiPrincipal, emiRate, emiYears]
  );

  const cagrResult = useMemo(
    () => calculatorService.calculateCagr(cagrInitial, cagrFinal, cagrYears),
    [cagrInitial, cagrFinal, cagrYears]
  );

  const ciResult = useMemo(
    () => calculatorService.calculateCompoundInterest(ciPrincipal, ciRate, ciYears, ciFreq),
    [ciPrincipal, ciRate, ciYears, ciFreq]
  );

  const swpResult = useMemo(
    () => calculatorService.calculateSwp(swpInitial, swpMonthly, swpRate, swpYears),
    [swpInitial, swpMonthly, swpRate, swpYears]
  );

  const retirementResult = useMemo(
    () =>
      calculatorService.calculateRetirement(
        currentAge,
        retirementAge,
        lifeExpectancy,
        monthlyExpense,
        inflationRate,
        preReturn,
        postReturn
      ),
    [
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpense,
      inflationRate,
      preReturn,
      postReturn,
    ]
  );

  // Pie chart data for SIP
  const sipPieData = [
    { name: "Invested Amount", value: sipResult.investedAmount },
    { name: "Estimated Returns", value: sipResult.estimatedReturns },
  ];

  // Pie chart data for EMI
  const emiPieData = [
    { name: "Principal Loan", value: emiResult.loanAmount },
    { name: "Total Interest", value: emiResult.totalInterest },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Financial Calculators Suite</h1>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            Institutional Math
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Precision calculators for wealth building, systematic compounding, mortgage amortization, and retirement planning.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab("sip")}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "sip"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          SIP Calculator
        </button>

        <button
          onClick={() => setActiveTab("emi")}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "emi"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          EMI Loan Calculator
        </button>

        <button
          onClick={() => setActiveTab("cagr")}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "cagr"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Percent className="h-4 w-4" />
          CAGR Calculator
        </button>

        <button
          onClick={() => setActiveTab("compound")}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "compound"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="h-4 w-4" />
          Compound Interest
        </button>

        <button
          onClick={() => setActiveTab("swp")}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "swp"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="h-4 w-4" />
          SWP Withdrawal
        </button>

        <button
          onClick={() => setActiveTab("retirement")}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "retirement"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <PiggyBank className="h-4 w-4" />
          Retirement Planner
        </button>
      </div>

      {/* SIP TAB CONTENT */}
      {activeTab === "sip" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                SIP Parameters
              </CardTitle>
              <CardDescription>
                Systematic Investment Plan compounding monthly contributions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>Monthly Investment</span>
                  <span className="font-mono text-primary font-bold">
                    ₹{sipMonthly.toLocaleString()}
                  </span>
                </div>
                <Input
                  type="number"
                  min={500}
                  step={500}
                  value={sipMonthly}
                  onChange={e => setSipMonthly(Number(e.target.value) || 0)}
                />
                <input
                  type="range"
                  min={500}
                  max={200000}
                  step={500}
                  value={sipMonthly}
                  onChange={e => setSipMonthly(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>Expected Annual Return Rate</span>
                  <span className="font-mono text-primary font-bold">{sipRate}%</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  step={0.5}
                  value={sipRate}
                  onChange={e => setSipRate(Number(e.target.value) || 0)}
                />
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={0.5}
                  value={sipRate}
                  onChange={e => setSipRate(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>Time Horizon (Years)</span>
                  <span className="font-mono text-primary font-bold">{sipYears} Years</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={sipYears}
                  onChange={e => setSipYears(Number(e.target.value) || 0)}
                />
                <input
                  type="range"
                  min={1}
                  max={35}
                  value={sipYears}
                  onChange={e => setSipYears(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-primary"
                />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invested Amount</span>
                  <span className="font-mono font-semibold">
                    ₹{sipResult.investedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Capital Gains</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{sipResult.estimatedReturns.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total Maturity Value</span>
                  <span className="font-mono text-primary text-xl">
                    ₹{sipResult.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Wealth Accumulation Trajectory</CardTitle>
              <CardDescription>
                Year-by-year compounding comparison between invested principal and accumulated returns.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sipResult.yearlyBreakdown}>
                    <defs>
                      <linearGradient id="totalValueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      tickFormatter={y => `Yr ${y}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <YAxis
                      tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [`₹${Number(val).toLocaleString()}`, ""]}
                      labelFormatter={l => `Year ${l}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      name="Total Value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#totalValueGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="investedAmount"
                      name="Invested Amount"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#investedGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-center">
                <div className="p-3 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Return on Investment
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    +{((sipResult.estimatedReturns / sipResult.investedAmount) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Wealth Multiplier
                  </div>
                  <div className="text-xl font-bold font-mono text-primary mt-1">
                    {(sipResult.totalValue / sipResult.investedAmount).toFixed(2)}x
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EMI TAB CONTENT */}
      {activeTab === "emi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Loan Parameters
              </CardTitle>
              <CardDescription>
                Compute monthly mortgage, auto, or personal loan repayments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>Loan Principal Amount</span>
                  <span className="font-mono text-primary font-bold">
                    ₹{emiPrincipal.toLocaleString()}
                  </span>
                </div>
                <Input
                  type="number"
                  min={50000}
                  step={50000}
                  value={emiPrincipal}
                  onChange={e => setEmiPrincipal(Number(e.target.value) || 0)}
                />
                <input
                  type="range"
                  min={100000}
                  max={20000000}
                  step={50000}
                  value={emiPrincipal}
                  onChange={e => setEmiPrincipal(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>Interest Rate (p.a)</span>
                  <span className="font-mono text-primary font-bold">{emiRate}%</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  step={0.1}
                  value={emiRate}
                  onChange={e => setEmiRate(Number(e.target.value) || 0)}
                />
                <input
                  type="range"
                  min={4}
                  max={20}
                  step={0.25}
                  value={emiRate}
                  onChange={e => setEmiRate(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span>Loan Tenure (Years)</span>
                  <span className="font-mono text-primary font-bold">{emiYears} Years</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={emiYears}
                  onChange={e => setEmiYears(Number(e.target.value) || 0)}
                />
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={emiYears}
                  onChange={e => setEmiYears(Number(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-primary"
                />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-base font-bold bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <span className="text-foreground">Monthly EMI</span>
                  <span className="font-mono text-primary text-xl">
                    ₹{emiResult.monthlyEmi.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Interest Payable</span>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                    ₹{emiResult.totalInterest.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount Payable</span>
                  <span className="font-mono font-semibold">
                    ₹{emiResult.totalPayment.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Break-up of Total Payment</CardTitle>
              <CardDescription>
                Proportion of Principal vs Total Interest over the loan life.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-2">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emiPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {emiPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: unknown) => [`₹${Number(v).toLocaleString()}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-center">
                <div className="p-3 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Interest to Principal Ratio
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                    {((emiResult.totalInterest / emiResult.loanAmount) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Tenure in Months
                  </div>
                  <div className="text-xl font-bold font-mono text-primary mt-1">
                    {emiYears * 12} Mos
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CAGR TAB CONTENT */}
      {activeTab === "cagr" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                CAGR Calculation
              </CardTitle>
              <CardDescription>
                Compound Annual Growth Rate smoothed over multi-year holding periods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial / Beginning Value</label>
                <Input
                  type="number"
                  value={cagrInitial}
                  onChange={e => setCagrInitial(Number(e.target.value) || 1)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Final / Ending Value</label>
                <Input
                  type="number"
                  value={cagrFinal}
                  onChange={e => setCagrFinal(Number(e.target.value) || 1)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Holding Duration (Years)</label>
                <Input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={cagrYears}
                  onChange={e => setCagrYears(Number(e.target.value) || 1)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-6 shadow-sm flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="text-base">Annualized Performance</CardTitle>
              <CardDescription>Geometric growth rate of your investment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Compound Annual Growth Rate (CAGR)
                </div>
                <div className="text-4xl font-extrabold font-mono text-primary mt-2">
                  {cagrResult.cagrPercentage >= 0 ? "+" : ""}
                  {cagrResult.cagrPercentage.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Equivalent to earning {cagrResult.cagrPercentage.toFixed(2)}% year-on-year
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase">Absolute Return</div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {cagrResult.absoluteReturnPercentage >= 0 ? "+" : ""}
                    {cagrResult.absoluteReturnPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase">Value Multiplier</div>
                  <div className="text-xl font-bold font-mono text-primary mt-1">
                    {(cagrFinal / (cagrInitial || 1)).toFixed(2)}x
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* COMPOUND INTEREST TAB */}
      {activeTab === "compound" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Compound Interest Parameters
              </CardTitle>
              <CardDescription>
                Calculate interest on initial principal plus accumulated interest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Principal Amount</label>
                <Input
                  type="number"
                  value={ciPrincipal}
                  onChange={e => setCiPrincipal(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Annual Interest Rate (%)</label>
                <Input
                  type="number"
                  step={0.1}
                  value={ciRate}
                  onChange={e => setCiRate(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Compounding Frequency</label>
                <select
                  value={ciFreq}
                  onChange={e => setCiFreq(e.target.value as "annual" | "semiannual" | "quarterly" | "monthly")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="annual">Annually (Once per year)</option>
                  <option value="semiannual">Semi-annually (Twice per year)</option>
                  <option value="quarterly">Quarterly (4 times per year)</option>
                  <option value="monthly">Monthly (12 times per year)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Time Period (Years)</label>
                <Input
                  type="number"
                  value={ciYears}
                  onChange={e => setCiYears(Number(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-6 shadow-sm flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="text-base">Maturity Summary</CardTitle>
              <CardDescription>Power of exponential compounding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Final Maturity Value
                </div>
                <div className="text-4xl font-extrabold font-mono text-primary mt-2">
                  ₹{ciResult.totalValue.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase">Principal Deposited</div>
                  <div className="text-lg font-bold font-mono mt-1">
                    ₹{ciPrincipal.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-muted/40 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase">Total Interest Earned</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    +₹{ciResult.totalInterest.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SWP TAB */}
      {activeTab === "swp" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                SWP Parameters
              </CardTitle>
              <CardDescription>
                Systematic Withdrawal Plan for passive income and post-retirement cash flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Corpus</label>
                <Input
                  type="number"
                  value={swpInitial}
                  onChange={e => setSwpInitial(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Withdrawal Required</label>
                <Input
                  type="number"
                  value={swpMonthly}
                  onChange={e => setSwpMonthly(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Expected Portfolio Return (%)</label>
                <Input
                  type="number"
                  step={0.5}
                  value={swpRate}
                  onChange={e => setSwpRate(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tenure (Years)</label>
                <Input
                  type="number"
                  value={swpYears}
                  onChange={e => setSwpYears(Number(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 shadow-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base">SWP Cash Flow & Balance</CardTitle>
              <CardDescription>Projection of income drawn vs capital preservation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                    Total Withdrawn
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{swpResult.totalWithdrawn.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-xs text-primary font-semibold uppercase">
                    Remaining Balance
                  </div>
                  <div className="text-2xl font-bold font-mono text-primary mt-1">
                    ₹{swpResult.finalValue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/40 rounded-lg space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Corpus Sustainability Insight
                </div>
                <p>
                  {swpResult.finalValue > swpInitial
                    ? "Your initial corpus continues to appreciate because the expected growth exceeds the monthly withdrawal rate."
                    : swpResult.finalValue > 0
                    ? "Your corpus successfully sustains withdrawals for the full duration with a positive remaining nest egg."
                    : "Warning: High withdrawal rate compared to return rate may deplete capital prematurely."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RETIREMENT TAB */}
      {activeTab === "retirement" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Retirement Planning Model
              </CardTitle>
              <CardDescription>
                Inflation-adjusted retirement target corpus & required monthly SIP.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Current Age</label>
                  <Input
                    type="number"
                    value={currentAge}
                    onChange={e => setCurrentAge(Number(e.target.value) || 20)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Retire Age</label>
                  <Input
                    type="number"
                    value={retirementAge}
                    onChange={e => setRetirementAge(Number(e.target.value) || 50)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Life Exp.</label>
                  <Input
                    type="number"
                    value={lifeExpectancy}
                    onChange={e => setLifeExpectancy(Number(e.target.value) || 80)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Current Monthly Expenses (₹)</label>
                <Input
                  type="number"
                  value={monthlyExpense}
                  onChange={e => setMonthlyExpense(Number(e.target.value) || 0)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Inflation (%)</label>
                  <Input
                    type="number"
                    step={0.5}
                    value={inflationRate}
                    onChange={e => setInflationRate(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Pre-Ret (%)</label>
                  <Input
                    type="number"
                    step={0.5}
                    value={preReturn}
                    onChange={e => setPreReturn(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Post-Ret (%)</label>
                  <Input
                    type="number"
                    step={0.5}
                    value={postReturn}
                    onChange={e => setPostReturn(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-6 shadow-sm flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="text-base">Financial Independence Milestones</CardTitle>
              <CardDescription>Required nest egg adjusted for cost of living</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Retirement Corpus Needed
                </div>
                <div className="text-3xl font-extrabold font-mono text-primary mt-2">
                  ₹{retirementResult.requiredCorpus.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Future monthly expenses at age {retirementAge}: ₹
                  {retirementResult.futureMonthlyExpense.toLocaleString()}
                </p>
              </div>

              <div className="p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Recommended Monthly SIP Today
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                  ₹{retirementResult.recommendedMonthlySip.toLocaleString()} / mo
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Investing this amount monthly achieves full financial freedom at age {retirementAge}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
