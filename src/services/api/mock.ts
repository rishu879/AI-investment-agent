export interface CompanyResearch {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  price: number;
  recommendation: "BUY" | "HOLD" | "SELL";
  score: number;
  confidence: number;
  marketCap: string;
  peRatio: string;
  revenue: string;
  profitMargin: string;
  metrics: Array<{
    title: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: "DollarSign" | "Activity" | "TrendingUp" | "Percent";
  }>;
  revenueData: Array<{ year: string; revenue: number; profit: number }>;
  stockData: Array<{ date: string; price: number }>;
  ratiosData: Array<{ metric: string; company: number; industry: number }>;
  news: Array<{
    id: string;
    title: string;
    source: string;
    time: string;
    sentiment: "Positive" | "Negative" | "Neutral";
    url: string;
  }>;
  risks: Array<{
    id: string;
    type: "High" | "Medium" | "Low";
    description: string;
  }>;
  thesis: string;
  thesisBullets: string[];
}

export interface SuggestedCompany {
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

const baseResearch: CompanyResearch = {
  ticker: "AAPL",
  name: "Apple Inc.",
  sector: "Technology",
  industry: "Consumer Electronics",
  description:
    "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
  price: 175.43,
  recommendation: "BUY",
  score: 88,
  confidence: 92,
  marketCap: "$2.73T",
  peRatio: "28.5",
  revenue: "$383.2B",
  profitMargin: "25.3%",
  metrics: [
    { title: "Market Cap", value: "$2.73T", icon: "DollarSign" },
    { title: "P/E Ratio", value: "28.5", change: "1.2", trend: "up", icon: "Activity" },
    { title: "Revenue (TTM)", value: "$383.2B", change: "2.1%", trend: "up", icon: "TrendingUp" },
    { title: "Profit Margin", value: "25.3%", change: "-0.4%", trend: "down", icon: "Percent" },
  ],
  revenueData: [
    { year: "2019", revenue: 260, profit: 55 },
    { year: "2020", revenue: 274, profit: 57 },
    { year: "2021", revenue: 365, profit: 94 },
    { year: "2022", revenue: 394, profit: 99 },
    { year: "2023", revenue: 383, profit: 97 },
  ],
  stockData: Array.from({ length: 30 }).map((_, i) => ({
    date: `2024-03-${String(i + 1).padStart(2, "0")}`,
    price: 160 + Math.random() * 20 + i * 0.5,
  })),
  ratiosData: [
    { metric: "Valuation", company: 75, industry: 60 },
    { metric: "Growth", company: 80, industry: 65 },
    { metric: "Profitability", company: 95, industry: 70 },
    { metric: "Health", company: 85, industry: 75 },
    { metric: "Dividend", company: 60, industry: 50 },
  ],
  news: [
    { id: "1", title: "Apple announces new AI features for iOS 18", source: "TechCrunch", time: "2h ago", sentiment: "Positive", url: "#" },
    { id: "2", title: "iPhone sales show resilience in Asian markets", source: "Bloomberg", time: "5h ago", sentiment: "Positive", url: "#" },
    { id: "3", title: "Antitrust lawsuit filed against App Store practices", source: "Reuters", time: "1d ago", sentiment: "Negative", url: "#" },
  ],
  risks: [
    { id: "1", type: "High", description: "Regulatory scrutiny and ongoing antitrust lawsuits regarding App Store fees in multiple jurisdictions." },
    { id: "2", type: "Medium", description: "Heavy reliance on iPhone sales which currently account for over 50% of total revenue." },
    { id: "3", type: "Low", description: "Supply chain disruptions in manufacturing hubs." },
  ],
  thesis:
    "The company presents a strong buying opportunity thanks to durable cash flow generation, ecosystem loyalty, and emerging AI-led growth catalysts.",
  thesisBullets: [
    "Services segment growth continues to expand margins.",
    "Capital return programs support shareholder value.",
    "Hardware refresh cycles are stabilizing after a soft patch.",
  ],
};

const companyMap: Record<string, CompanyResearch> = {
  AAPL: {
    ...baseResearch,
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    industry: "Consumer Electronics",
    price: 175.43,
    recommendation: "BUY",
    score: 88,
    confidence: 92,
  },
  TSLA: {
    ...baseResearch,
    ticker: "TSLA",
    name: "Tesla, Inc.",
    sector: "Automotive",
    industry: "Electric Vehicles",
    price: 175.22,
    recommendation: "HOLD",
    score: 61,
    confidence: 74,
    marketCap: "$560B",
    peRatio: "46.2",
    revenue: "$94.0B",
    profitMargin: "9.2%",
    thesis:
      "Tesla remains attractive for long-term growth, but execution risk and valuation discipline warrant a measured stance.",
    thesisBullets: [
      "Vehicle delivery growth is improving but still cyclical.",
      "Energy storage is a meaningful margin lever.",
      "Competition is intensifying in the EV market.",
    ],
  },
  NVDA: {
    ...baseResearch,
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    sector: "Technology",
    industry: "Semiconductors",
    price: 890.1,
    recommendation: "BUY",
    score: 94,
    confidence: 95,
    marketCap: "$2.18T",
    peRatio: "49.1",
    revenue: "$61.1B",
    profitMargin: "55.2%",
    thesis:
      "NVIDIA is well positioned to capture AI infrastructure demand and maintain exceptional profitability.",
    thesisBullets: [
      "Data center demand remains exceptionally strong.",
      "Gross margins are supported by a premium product stack.",
      "Supply constraints may temporarily limit execution.",
    ],
  },
};

export const mockSuggestedCompanies: SuggestedCompany[] = [
  { name: "Apple Inc.", ticker: "AAPL", price: 175.43, change: 1.2, changePercent: 0.69, sector: "Technology" },
  { name: "Tesla, Inc.", ticker: "TSLA", price: 175.22, change: -4.3, changePercent: -2.39, sector: "Automotive" },
  { name: "NVIDIA Corp.", ticker: "NVDA", price: 890.1, change: 12.5, changePercent: 1.42, sector: "Technology" },
];

export const mockRecentSearches = ["MSFT", "AMZN", "GOOGL", "META"];

export const mockHistory = [
  { id: "1", ticker: "AAPL", name: "Apple Inc.", date: "2024-03-12T10:30:00Z", recommendation: "BUY", score: 85 },
  { id: "2", ticker: "TSLA", name: "Tesla, Inc.", date: "2024-03-10T14:15:00Z", recommendation: "HOLD", score: 55 },
  { id: "3", ticker: "AMC", name: "AMC Entertainment", date: "2024-03-08T09:20:00Z", recommendation: "SELL", score: 32 },
];

export async function getCompanyResearch(ticker: string): Promise<CompanyResearch> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return companyMap[ticker.toUpperCase()] ?? { ...baseResearch, ticker: ticker.toUpperCase(), name: `${ticker.toUpperCase()} Corp.` };
}

export async function getRecentSearches(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return mockRecentSearches;
}

export async function getSuggestedCompanies(): Promise<SuggestedCompany[]> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return mockSuggestedCompanies;
}
