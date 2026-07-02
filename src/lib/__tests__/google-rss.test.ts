import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleNewsRSSService } from "@/services/news/google-rss";

describe("GoogleNewsRSSService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  it("normalizes RSS items into news articles", () => {
    const service = new GoogleNewsRSSService();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Google News</title>
          <item>
            <title>Apple announces new earnings guidance</title>
            <description>Apple said growth remains strong.</description>
            <link>https://example.com/apple-earnings</link>
            <pubDate>Wed, 02 Jul 2026 10:00:00 GMT</pubDate>
            <source>Reuters</source>
          </item>
          <item>
            <title>Apple expands AI partnership</title>
            <link>https://example.com/apple-ai</link>
            <pubDate>Wed, 02 Jul 2026 09:00:00 GMT</pubDate>
            <source>Bloomberg</source>
          </item>
        </channel>
      </rss>`;

    const articles = service.normalizeArticles(xml);

    expect(articles).toHaveLength(2);
    expect(articles[0]).toMatchObject({
      title: "Apple announces new earnings guidance",
      url: "https://example.com/apple-earnings",
      source: "Reuters",
      summary: "Apple said growth remains strong.",
    });
  });

  it("returns an empty array when the feed is invalid", async () => {
    const service = new GoogleNewsRSSService();
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response("<invalid></invalid>", { status: 200 }));

    const result = await service.getCompanyNews("Apple");

    expect(result).toEqual([]);
  });
});
