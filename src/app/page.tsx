"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, LineChart, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full py-24 lg:py-32 xl:py-48 bg-dot-black/[0.2] dark:bg-dot-white/[0.2] relative flex items-center justify-center"
        >
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-background bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                AI-Powered Financial Research
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Invest Smarter with <br className="hidden sm:inline" />
                <span className="text-primary">AI Insights</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Get comprehensive institutional-grade investment research in seconds. Analyze fundamentals, sentiment, and risks with advanced AI models.
              </p>
              <div className="space-x-4 mt-6">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/dashboard">
                    Start Researching <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Deep Analysis at Scale</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our autonomous agent pulls real-time data to deliver a complete picture.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <LineChart className="h-10 w-10 text-primary" />,
                  title: "Financial Modeling",
                  description: "Analyzes income statements, balance sheets, and cash flows to evaluate true intrinsic value.",
                },
                {
                  icon: <Bot className="h-10 w-10 text-primary" />,
                  title: "AI Agent Reasoning",
                  description: "LangGraph-powered reasoning that weighs pros and cons to make an INVEST or PASS decision.",
                },
                {
                  icon: <Shield className="h-10 w-10 text-primary" />,
                  title: "Risk Assessment",
                  description: "Identifies red flags, debt issues, and competitive threats before you invest.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="p-3 bg-primary/10 rounded-full">{feature.icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How It Works</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">1</div>
                <h3 className="text-xl font-bold">Search</h3>
                <p className="text-muted-foreground">Enter any public company ticker or name.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">2</div>
                <h3 className="text-xl font-bold">Analyze</h3>
                <p className="text-muted-foreground">The AI gathers data and performs deep fundamental analysis.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">3</div>
                <h3 className="text-xl font-bold">Decide</h3>
                <p className="text-muted-foreground">Review the comprehensive report and make an informed decision.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to invest smarter?</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-primary-foreground/80 md:text-xl">
              Join thousands of investors using AI InvestAgent for better decisions.
            </p>
            <Button variant="secondary" size="lg" className="mt-8 rounded-full" asChild>
              <Link href="/dashboard">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
