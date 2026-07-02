import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface CompanyCardProps {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

export function CompanyCard({
  name,
  ticker,
  price,
  change,
  changePercent,
  sector,
}: CompanyCardProps) {
  const isPositive = change >= 0;

  return (
    <Link href={`/dashboard/research/${ticker}`}>
      <Card className="group overflow-hidden rounded-xl transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold leading-none mb-1">{ticker}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{name}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {sector}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">${price.toFixed(2)}</div>
              <div
                className={`flex items-center text-sm font-medium mt-1 ${
                  isPositive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {isPositive ? "+" : ""}
                {change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
