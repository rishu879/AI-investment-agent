import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskItem {
  id: string;
  type: "High" | "Medium" | "Low";
  description: string;
}

interface RiskCardProps {
  risks: RiskItem[];
  className?: string;
}

export function RiskCard({ risks, className }: RiskCardProps) {
  const getRiskIcon = (type: string) => {
    switch (type) {
      case "High":
        return <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />;
      case "Medium":
        return <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />;
      case "Low":
        return <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />;
    }
  };

  return (
    <Card className={cn("rounded-xl h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <span>Risk Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {risks.map((risk) => (
            <div key={risk.id} className="flex items-start space-x-3 bg-muted/50 p-3 rounded-lg">
              {getRiskIcon(risk.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-1",
                    risk.type === "High" ? "text-red-500" :
                    risk.type === "Medium" ? "text-amber-500" :
                    "text-emerald-500"
                  )}>
                    {risk.type} Risk
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {risk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
