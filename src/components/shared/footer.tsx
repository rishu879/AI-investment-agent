import Link from "next/link";
import { LineChart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <LineChart className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">AI InvestAgent</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Empowering investors with deep AI-driven research and fundamental analysis.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-sm">Product</h3>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-sm">Legal</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI InvestAgent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
