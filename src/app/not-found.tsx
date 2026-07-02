import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)] px-4">
      <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-background/80 p-10 text-center shadow-2xl shadow-primary/10 backdrop-blur">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">We lost that page.</h1>
        <p className="mt-4 text-base text-muted-foreground">
          The research view you requested is not available right now. Head back to the dashboard to continue exploring companies.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/about">Learn more</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
