import type { NewsItem } from "@/types/research";

export interface MarketAnalysisPromptInput {
  news: NewsItem[];
  additionalContext: string;
}

export const marketAnalysisPrompt = ({ news, additionalContext }: MarketAnalysisPromptInput) => `You are a market analyst. Based on the latest headlines and any additional context, summarize the current sentiment and macro themes that are most relevant for this ticker.

Latest headlines:
${news.map((item, index) => `- [${index + 1}] ${item.title}`).join("\n")}

Additional context:
${additionalContext || "None"}

Provide a short market outlook and note any external events that may influence the stock's performance.`;
