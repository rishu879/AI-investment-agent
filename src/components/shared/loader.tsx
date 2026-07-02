import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  className?: string;
}

export function Loader({ text = "Loading...", className }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}
