import type { NewsItem } from "@/types/research";
import { GoogleNewsTool } from "@/tools/google-news-tool";

const googleNewsTool = new GoogleNewsTool();

export class NewsService {
  async getNews(ticker: string): Promise<NewsItem[]> {
    const result = await googleNewsTool.execute({ query: ticker });
    return result.ok && result.data?.length ? result.data : [];
  }
}

export const newsService = new NewsService();
