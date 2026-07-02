import axios from "axios";
import { env } from "@/config/env";
import { withTimeout } from "@/lib/timeout";

export async function fetchYahooFinanceSnapshot(ticker: string) {
  try {
    const url = `${env.YAHOO_FINANCE_BASE_URL}/v8/finance/chart/${ticker.toUpperCase()}?interval=1d&range=1mo`;
    const response = await withTimeout(axios.get(url, { timeout: 4_000 }), 4_500);
    return response.data;
  } catch {
    return null;
  }
}
