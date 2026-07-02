import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, LineChart, Shield, Database, Cpu, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              About AI InvestAgent
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;re building the future of autonomous financial research. Our platform combines advanced language models with real-time financial data to give you institutional-grade insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To democratize access to high-quality investment research. By leveraging state-of-the-art AI, we aim to provide every investor with the analytical firepower previously reserved for large hedge funds and institutional players.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm font-medium">
                  <Bot className="h-5 w-5 text-primary mr-3" /> Autonomous Analysis
                </li>
                <li className="flex items-center text-sm font-medium">
                  <Database className="h-5 w-5 text-primary mr-3" /> Real-time Data processing
                </li>
                <li className="flex items-center text-sm font-medium">
                  <Shield className="h-5 w-5 text-primary mr-3" /> Unbiased reporting
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/0 rounded-2xl blur-3xl -z-10" />
              <Card className="border-muted bg-background/50 backdrop-blur">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold mb-1">100k+</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Analyses</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">50ms</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Latency</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">99.9%</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">24/7</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Monitoring</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">The Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-muted/30 border-none">
              <CardContent className="pt-6">
                <Cpu className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">LangGraph Core</h3>
                <p className="text-sm text-muted-foreground">Multi-agent architecture that orchestrates data gathering, analysis, and reasoning steps seamlessly.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none">
              <CardContent className="pt-6">
                <Globe className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Next.js 15 App Router</h3>
                <p className="text-sm text-muted-foreground">Lightning-fast React framework with Server Components for optimal performance and SEO.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none">
              <CardContent className="pt-6">
                <LineChart className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Financial APIs</h3>
                <p className="text-sm text-muted-foreground">Direct integrations with top-tier financial data providers for accurate and timely information.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
