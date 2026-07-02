import { BaseTool, ToolResult } from "@/tools/base";
import type { NewsItem } from "@/types/research";
import { GoogleNewsRSSService } from "@/services/news/google-rss";

export class GoogleNewsTool extends BaseTool<{ query: string }, NewsItem[]> {
  name = "GoogleNewsTool";
  private readonly service = new GoogleNewsRSSService();

  async execute({ query }: { query: string }): Promise<ToolResult<NewsItem[]>> {
    try {
      const articles = await this.service.searchNews(query);
      return { ok: true, data: articles };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Google News RSS fetch failed" };
    }
  }
}
