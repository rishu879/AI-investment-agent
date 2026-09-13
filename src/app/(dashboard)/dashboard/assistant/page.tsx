"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  LineChart,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  detectedTicker?: string | null;
  timestamp: string;
}

const STARTER_PROMPTS = [
  "Analyze NVIDIA's valuation and Blackwell GPU catalyst",
  "Compare Tata Motors vs Maruti Suzuki for long-term compounding",
  "How should I hedge my tech portfolio against interest rate volatility?",
  "What is the thesis for Reliance Industries' retail & telecom spinoff?",
  "Explain P/E ratio, PEG, and Free Cash Flow Yield simply",
];

const INITIAL_GREETING: Message = {
  id: "msg-0",
  role: "assistant",
  content: `### Welcome to your AI Financial Strategist

I am your institutional-grade market research assistant. You can ask me to:
- **Analyze Equities:** Deep dive into fundamentals, competitive moats, and valuation multiples.
- **Compare Peers:** Contrast margins, growth rates, and market positioning between competing companies.
- **Formulate Strategies:** Discuss risk management, asset allocation, and market indicators.
- **Explain Concepts:** Demystify balance sheet items, DCF modeling, or technical indicators.

*Select a question below or enter your query to begin.*`,
  timestamp: "Just now",
};

let messageCounter = 0;
function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: query,
      timestamp: getFormattedTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with AI Assistant");
      }

      const data = await res.json();
      const replyText = data.data?.reply || "Unable to synthesize response. Please try again.";
      const detectedTicker = data.data?.detectedTicker;

      const aiMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        content: replyText,
        detectedTicker,
        timestamp: getFormattedTime(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your financial inquiry. Please verify your connection or try another ticker.",
        timestamp: getFormattedTime(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  // Helper to render basic markdown formatting cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-base font-bold text-foreground mt-3 mb-1">
                {line.replace("### ", "")}
              </h3>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-lg font-bold text-foreground mt-3 mb-1">
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            const raw = line.slice(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{renderInlineFormatting(raw)}</span>
              </div>
            );
          }
          if (line.startsWith("*") && line.endsWith("*") && !line.includes("**")) {
            return (
              <p key={idx} className="text-xs text-muted-foreground italic mt-2 border-t pt-2">
                {line.replace(/\*/g, "")}
              </p>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    // Basic bold and code segment formatting
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary font-medium"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">AI Financial Assistant</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 gap-1">
              <Sparkles className="h-3 w-3" /> Gemini Pro Reasoning
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time equity breakdown, valuation models, competitive dynamics, and portfolio guidance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearChat}
          className="h-8 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          New Conversation
        </Button>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col min-h-0 shadow-sm border overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map(msg => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border text-primary"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-xs ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-muted/40 border text-card-foreground rounded-tl-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div>
                      {renderFormattedContent(msg.content)}

                      {/* Detected Asset Quick Action Bar */}
                      {msg.detectedTicker && (
                        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            Live Tools for {msg.detectedTicker}:
                          </span>
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs gap-1"
                          >
                            <Link
                              href={`/dashboard/technical?ticker=${encodeURIComponent(
                                msg.detectedTicker
                              )}`}
                            >
                              <LineChart className="h-3.5 w-3.5 text-primary" />
                              Technical & AI Forecast
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                          >
                            <Link
                              href={`/dashboard/research?ticker=${encodeURIComponent(
                                msg.detectedTicker
                              )}`}
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              Fundamentals
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 ${
                      isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="h-8 w-8 rounded-lg bg-muted border text-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-muted/40 border px-4 py-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
                  Synthesizing institutional analysis...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Chips (Only if few messages) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t bg-muted/20">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              Suggested Market Inquiries:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-background hover:bg-muted text-foreground border rounded-full px-3 py-1 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t bg-card shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Ask about any stock, valuation metric, or market scenario..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>
          </form>
          <div className="text-[11px] text-muted-foreground text-center mt-2">
            AI InvestAgent produces synthetic equity research for educational and informational purposes. Always verify before trading.
          </div>
        </div>
      </Card>
    </div>
  );
}
