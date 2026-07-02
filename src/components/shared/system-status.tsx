import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import type { HealthStatus } from "@/services/api/backend";

interface SystemStatusProps {
  statuses: HealthStatus[];
}

export function SystemStatus({ statuses }: SystemStatusProps) {
  return (
    <Card className="rounded-xl border border-border/70 bg-background/80">
      <CardHeader>
        <CardTitle className="text-lg">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statuses.map((status) => (
          <div key={status.service} className="flex items-center justify-between gap-3 rounded-xl border border-muted/20 bg-muted/5 p-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {status.healthy ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{status.service}</span>
              </div>
              <p className="text-xs text-muted-foreground">{status.message}</p>
            </div>
            <Badge variant={status.healthy ? "outline" : "destructive"}>
              {status.healthy ? "Healthy" : "Unavailable"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
