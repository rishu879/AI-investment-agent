"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConfidenceBreakdown } from "@/types/research";

interface ConfidenceBreakdownProps {
  breakdown: ConfidenceBreakdown;
}

const labels = [
  { key: "financialHealth", label: "Financial Health" },
  { key: "growth", label: "Growth" },
  { key: "profitability", label: "Profitability" },
  { key: "risk", label: "Risk" },
  { key: "newsSentiment", label: "News Sentiment" },
  { key: "overallRecommendation", label: "Overall Recommendation" },
];

export function ConfidenceBreakdownCard({ breakdown }: ConfidenceBreakdownProps) {
  const items = labels.map((item) => ({
    ...item,
    value: Math.round((breakdown[item.key as keyof ConfidenceBreakdown] ?? 0) * 100),
  }));

  return (
    <Card className="rounded-3xl border border-border/70 bg-background/80">
      <CardHeader>
        <CardTitle>Confidence Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
