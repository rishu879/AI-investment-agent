import axios from "axios";
import { env } from "@/config/env";
import { BaseTool, ToolResult } from "@/tools/base";
import type { NewsItem } from "@/types/research";

interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
}

interface TavilySearchResponse {
  results?: TavilySearchResult[];
}

export class TavilySearchTool extends BaseTool<{ query: string }, NewsItem[]> {
  name = "TavilySearchTool";

  async execute({ query }: { query: string }): Promise<ToolResult<NewsItem[]>> {
    if (!env.TAVILY_API_KEY) {
      return { ok: false, error: "Tavily API key is not configured" };
    }

    try {
      const response = await axios.post<TavilySearchResponse>("https://api.tavily.com/search", {
        api_key: env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
      }, {
        timeout: 5_000,
      });

      const results = response.data?.results ?? [];
      return {
        ok: true,
        data: results.slice(0, 5).map((item) => ({
          title: String(item.title ?? "Untitled"),
          url: String(item.url ?? ""),
          source: "Tavily",
          publishedAt: new Date().toISOString(),
          summary: String(item.content ?? ""),
        })),
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Tavily search failed" };
    }
  }
}
