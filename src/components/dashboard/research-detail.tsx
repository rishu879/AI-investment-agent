"use client";

import { useMemo } from "react";
import type { ResearchResult } from "@/types/research";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResearchDetailProps {
  data: ResearchResult;
}

export function ResearchDetail({ data }: ResearchDetailProps) {
  const sections = useMemo(
    () => [
      { title: "Executive Summary", content: data.summary },
      { title: "Why Invest", content: data.recommendation.rationale },
      { title: "Why Not Invest", content: data.risk.details },
      { title: "Financial Analysis", content: data.explainability },
      { title: "Competitive Analysis", content: `The company operates in ${data.company.sector} and is assessed against current market conditions.` },
      { title: "Growth Analysis", content: `Revenue growth is ${data.financials.revenueGrowth != null ? `${(data.financials.revenueGrowth * 100).toFixed(1)}%` : "not available"}.` },
      { title: "Risk Analysis", content: data.risk.details },
      { title: "Long-Term Outlook", content: `The long-term view remains tied to durable growth and balance-sheet discipline.` },
      { title: "Short-Term Outlook", content: `Near-term sentiment is ${data.sentiment.label} with a score of ${data.sentiment.score.toFixed(2)}.` },
      { title: "Final Recommendation", content: `${data.recommendation.value.replace(/_/g, " ").toUpperCase()} — ${data.recommendation.rationale}` },
    ],
    [data]
  );

  return (
    <Card className="rounded-3xl border border-border/70 bg-background/80">
      <CardHeader>
        <CardTitle>AI Explainability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-border/70 bg-muted/5 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold">{section.title}</h3>
              <Badge variant="outline">AI</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{section.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
