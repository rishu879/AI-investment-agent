"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ai-investment-agent-token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="rounded-3xl border border-border/70 bg-background/90 p-8 text-center shadow-lg">
          <p className="text-lg font-semibold">Verifying your session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
