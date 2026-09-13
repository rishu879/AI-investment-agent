"use client";

import { useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot() {
  return window.localStorage.getItem("ai-investment-agent-token");
}

function getServerSnapshot() {
  return "placeholder";
}

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
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
