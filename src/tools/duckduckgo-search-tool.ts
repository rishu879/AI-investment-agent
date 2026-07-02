import axios from "axios";
import { BaseTool, ToolResult } from "@/tools/base";
import type { NewsItem } from "@/types/research";

interface DuckDuckGoRelatedTopic {
  Text?: string;
  FirstURL?: string;
  Result?: string;
}

interface DuckDuckGoResponse {
  AbstractText?: string;
  AbstractURL?: string;
  RelatedTopics?: DuckDuckGoRelatedTopic[];
}

export class DuckDuckGoSearchTool extends BaseTool<{ query: string }, NewsItem[]> {
  name = "DuckDuckGoSearchTool";

  async execute({ query }: { query: string }): Promise<ToolResult<NewsItem[]>> {
    if (!query) {
      return { ok: false, error: "Query is required" };
    }

    try {
      const response = await axios.get("https://api.duckduckgo.com", {
        params: {
          q: query,
          format: "json",
          no_html: 1,
          skip_disambig: 1,
        },
        timeout: 5_000,
      });

      const data = response.data as DuckDuckGoResponse;
      const results: NewsItem[] = [];

      if (data.AbstractText) {
        results.push({
          title: query,
          url: data.AbstractURL || "",
          source: "DuckDuckGo",
          publishedAt: new Date().toISOString(),
          summary: data.AbstractText,
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const item of data.RelatedTopics.slice(0, 5)) {
          const text = item.Text ?? item.FirstURL;
          if (!text) continue;
          results.push({
            title: typeof text === "string" ? text : String(text),
            url: item.FirstURL ?? "",
            source: "DuckDuckGo",
            publishedAt: new Date().toISOString(),
            summary: item.Result?.replace(/<[^>]*>/g, "") ?? "",
          });
        }
      }

      return { ok: true, data: results.slice(0, 5) };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "DuckDuckGo search failed" };
    }
  }
}
