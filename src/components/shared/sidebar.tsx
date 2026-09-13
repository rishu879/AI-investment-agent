"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  TrendingUp,
  SlidersHorizontal,
  LineChart,
  Briefcase,
  Bookmark,
  Calculator,
  Bot,
  History,
  Sparkles,
  Zap,
  GraduationCap,
} from "lucide-react";

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Trading Practice (Demo)", href: "/dashboard/trading-practice", icon: Zap },
  { name: "Learner Academy", href: "/dashboard/learn", icon: GraduationCap },
  { name: "Live Markets", href: "/dashboard/markets", icon: TrendingUp },
  { name: "Stock Screener", href: "/dashboard/screener", icon: SlidersHorizontal },
  { name: "Technical & AI Predictor", href: "/dashboard/technical", icon: LineChart },
  { name: "Portfolio Tracker", href: "/dashboard/portfolio", icon: Briefcase },
  { name: "Watchlist & Alerts", href: "/dashboard/watchlist", icon: Bookmark },
  { name: "Financial Calculators", href: "/dashboard/calculators", icon: Calculator },
  { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
  { name: "Research History", href: "/dashboard/history", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-card text-card-foreground">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI InvestAgent
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 py-1 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Core Platform
        </div>
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold text-foreground">Pro Institutional</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug mb-3">
            Real-time market streaming, ML predictions & unlimited AI assistant queries.
          </p>
          <button className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
