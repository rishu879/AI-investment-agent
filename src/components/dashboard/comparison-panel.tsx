"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResearchResult } from "@/types/research";

interface ComparisonPanelProps {
  primary: ResearchResult;
  secondary: ResearchResult;
}

export function ComparisonPanel({ primary, secondary }: ComparisonPanelProps) {
  const rows = [
    { label: "Recommendation", primary: primary.recommendation.value.replace(/_/g, " "), secondary: secondary.recommendation.value.replace(/_/g, " ") },
    { label: "Confidence", primary: `${Math.round(primary.confidence * 100)}%`, secondary: `${Math.round(secondary.confidence * 100)}%` },
    { label: "Market Cap", primary: primary.company.marketCap, secondary: secondary.company.marketCap },
    { label: "P/E Ratio", primary: primary.financials.peRatio?.toFixed(1) ?? "N/A", secondary: secondary.financials.peRatio?.toFixed(1) ?? "N/A" },
    { label: "Revenue Growth", primary: `${(primary.financials.revenueGrowth ?? 0) * 100}%`, secondary: `${(secondary.financials.revenueGrowth ?? 0) * 100}%` },
  ];

  return (
    <Card className="rounded-3xl border border-border/70 bg-background/80">
      <CardHeader>
        <CardTitle>Company Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-3">Metric</th>
                <th className="pb-3">{primary.company.name}</th>
                <th className="pb-3">{secondary.company.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-border/70">
                  <td className="py-3 font-medium">{row.label}</td>
                  <td className="py-3">{row.primary}</td>
                  <td className="py-3">{row.secondary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
