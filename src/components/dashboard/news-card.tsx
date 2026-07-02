import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  url: string;
}

interface NewsCardProps {
  news: NewsItem[];
}

export function NewsCard({ news }: NewsCardProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-500/15 text-emerald-600";
      case "Negative":
        return "bg-red-500/15 text-red-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="rounded-xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Latest News & Sentiment</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pr-2">
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={item.url}
                  target="_blank"
                  className="text-sm font-medium hover:text-primary transition-colors leading-snug"
                >
                  {item.title}
                </Link>
                <Link href={item.url} target="_blank">
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors shrink-0" />
                </Link>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
                <Badge variant="secondary" className={`text-[10px] ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
