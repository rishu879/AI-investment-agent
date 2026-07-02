import { withRetry } from "@/lib/retry";
import { withTimeout } from "@/lib/timeout";
import type { NewsItem } from "@/types/research";
import { XMLParser } from "fast-xml-parser";
import { logError, logInfo } from "@/lib/logger";

export class GoogleNewsRSSService {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true,
    parseTagValue: false,
    parseAttributeValue: false,
    removeNSPrefix: true,
    textNodeName: "_text",
  });

  async getCompanyNews(company: string): Promise<NewsItem[]> {
    return this.searchNews(company);
  }

  async searchNews(query: string): Promise<NewsItem[]> {
    if (!query?.trim()) {
      return [];
    }

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query.trim())}`;

    try {
      const response = await withRetry(
        () =>
          withTimeout(
            fetch(url, {
              headers: {
                "User-Agent": "Mozilla/5.0",
              },
            }),
            8_000
          ),
        { retries: 1 }
      );

      if (!response.ok) {
        logError("Google News RSS request failed", { query, status: response.status });
        return [];
      }

      const xml = await response.text();
      const articles = this.normalizeArticles(xml).slice(0, 10);
      logInfo("Google News RSS parsed", { query, count: articles.length });
      return articles;
    } catch (error) {
      logError("Google News RSS fetch failed", { query, error });
      return [];
    }
  }

  normalizeArticles(xml: string): NewsItem[] {
    try {
      const parsed = this.parser.parse(xml);
      const channel = parsed?.rss?.channel ?? parsed?.feed;
      const items = channel?.item ?? channel?.entry ?? [];
      const articleList = Array.isArray(items) ? items : items ? [items] : [];

      return articleList
        .map((item) => this.normalizeArticle(item))
        .filter((item): item is NewsItem => Boolean(item));
    } catch {
      return [];
    }
  }

  private normalizeArticle(item: Record<string, unknown>): NewsItem | null {
    const title = this.readString(item.title);
    const description = this.readString(item.description) || this.readString(item.summary) || this.readString(item["content:encoded"]);
    const url = this.readString(item.link) || this.readString(item.guid);
    const publishedAt = this.normalizeDate(this.readString(item.pubDate) || this.readString(item.published) || this.readString(item.updated));
    const source = this.readString(item.source) || this.readString(item["dc:publisher"]) || "Google News";

    if (!title || !url) {
      return null;
    }

    return {
      title,
      url,
      source,
      publishedAt,
      summary: description,
      description,
    };
  }

  private readString(value: unknown): string {
    if (typeof value === "string") {
      return value.replace(/<[^>]*>/g, "").trim();
    }

    if (Array.isArray(value)) {
      return this.readString(value.find((entry) => typeof entry === "string" || (entry && typeof entry === "object")) ?? "");
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record["#text"] === "string") {
        return record["#text"].replace(/<[^>]*>/g, "").trim();
      }
      if (typeof record.url === "string") {
        return record.url;
      }
      if (typeof record.href === "string") {
        return record.href;
      }
    }

    return "";
  }

  private normalizeDate(value: string): string {
    if (!value) {
      return new Date().toISOString();
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
}
