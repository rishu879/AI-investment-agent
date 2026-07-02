import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { RecommendationValue } from "@/types/research";

interface ScoreCardProps {
  score: number; // 0 to 100
  recommendation: RecommendationValue;
  confidence: number; // 0 to 100
  breakdown?: {
    financialHealth: number;
    growth: number;
    profitability: number;
    risk: number;
    newsSentiment: number;
  };
  className?: string;
}

export function ScoreCard({
  score,
  recommendation,
  confidence,
  breakdown,
  className,
}: ScoreCardProps) {
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-500";
    if (val >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getRecommendationBadge = (rec: RecommendationValue) => {
    const normalized = rec.replace("_", " ").toUpperCase();
    switch (rec) {
      case "strong_buy":
      case "buy":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">{normalized}</Badge>;
      case "hold":
        return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25">{normalized}</Badge>;
      case "sell":
      case "strong_sell":
        return <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25" variant="destructive">{normalized}</Badge>;
      default:
        return <Badge variant="secondary">{normalized}</Badge>;
    }
  };

  return (
    <Card className={cn("rounded-xl", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          AI Investment Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline space-x-2">
            <span className={cn("text-4xl font-bold", getScoreColor(score))}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Recommendation
            </span>
            {getRecommendationBadge(recommendation)}
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-muted-foreground">AI Confidence</span>
            <span className="font-semibold">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />

          {breakdown ? (
            <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/5 p-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Financial health</span>
                <span>{Math.round(breakdown.financialHealth * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Growth signal</span>
                <span>{Math.round(breakdown.growth * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Profitability</span>
                <span>{Math.round(breakdown.profitability * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Risk adjustment</span>
                <span>{Math.round(breakdown.risk * 100)}%</span>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
