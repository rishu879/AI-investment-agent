import { CheckCircle, ChevronRight, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  label: string;
  status: "pending" | "active" | "completed" | "error";
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
}

export function ProgressTracker({ steps }: ProgressTrackerProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.label} className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-4 py-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border text-white",
            step.status === "completed" && "border-emerald-500 bg-emerald-500",
            step.status === "active" && "border-primary bg-primary text-white",
            step.status === "pending" && "border-muted bg-muted-foreground/5 text-muted-foreground",
            step.status === "error" && "border-rose-500 bg-rose-500"
          )}>
            {step.status === "completed" ? <CheckCircle className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{step.label}</span>
              {step.status === "error" && <span className="text-rose-500">Failed</span>}
              {step.status === "active" && <span className="text-primary">In progress</span>}
            </div>
            <p className="text-xs text-muted-foreground">{step.status === "completed" ? "Done" : step.status === "pending" ? "Waiting" : step.status === "active" ? "Running" : "Retry needed"}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}
