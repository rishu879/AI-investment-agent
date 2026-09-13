import { NextRequest } from "next/server";
import { GeminiTool } from "@/tools/gemini-tool";
import { companyService } from "@/services/company-service";
import { internalError, badRequest, ok } from "@/lib/http";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const geminiTool = new GeminiTool();

const COMMON_TICKER_MAP: Record<string, string> = {
  "tata motors": "TATAMOTORS.NS",
  "reliance": "RELIANCE.NS",
  "tcs": "TCS.NS",
  "infosys": "INFY.NS",
  "hdfc": "HDFCBANK.NS",
  "icici": "ICICIBANK.NS",
  "apple": "AAPL",
  "nvidia": "NVDA",
  "microsoft": "MSFT",
  "google": "GOOGL",
  "alphabet": "GOOGL",
  "tesla": "TSLA",
  "amazon": "AMZN",
  "meta": "META",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || body.prompt;

    if (!message || typeof message !== "string" || !message.trim()) {
      return badRequest("Message query is required");
    }

    const lower = message.toLowerCase();
    let detectedTicker: string | null = null;

    // Check ticker map
    for (const [name, sym] of Object.entries(COMMON_TICKER_MAP)) {
      if (lower.includes(name)) {
        detectedTicker = sym;
        break;
      }
    }

    // Also check ticker pattern like $AAPL or uppercase words
    if (!detectedTicker) {
      const match = message.match(/\b([A-Z]{1,5}(\.[A-Z]{2})?)\b/);
      if (match && !["I", "A", "THE", "AI", "PE", "EPS", "SIP", "EMI"].includes(match[1])) {
        detectedTicker = match[1];
      }
    }

    let marketContext = "";
    if (detectedTicker) {
      try {
        const snap = await companyService.getCompanySnapshot(detectedTicker);
        marketContext = `\nREAL-TIME MARKET CONTEXT FOR ${snap.ticker}:
- Name: ${snap.name}
- Current Price: ${snap.currency} ${snap.currentPrice}
- Market Cap: ${snap.marketCap}
- Sector: ${snap.sector}
- Exchange: ${snap.exchange}
- Description: ${(snap.description || "").slice(0, 200)}...`;
      } catch (err) {
        logError("Failed to fetch assistant contextual snapshot", { detectedTicker, err });
      }
    }

    const systemPrompt = `You are an Institutional AI Senior Financial Analyst and Portfolio Strategist.
Your role is to advise investors with data-driven, clear, concise, and structured financial intelligence.
${marketContext}

Guidelines:
1. Provide actionable and balanced analysis (Buy / Hold / Sell perspective with pros and cons).
2. Highlight specific metrics (e.g. P/E, Cash Flow, Growth Drivers, Competitive Moat).
3. Include critical risk factors or red flags.
4. If comparing companies, contrast their valuation, margins, and industry positioning.
5. Format cleanly using markdown: bold headers, bullet points, and clean highlights.
6. Always include a brief disclaimer that insights are for educational & research purposes.

User Query: "${message}"`;

    let reply = "";
    const aiResult = await geminiTool.execute({ prompt: systemPrompt });

    if (aiResult.ok && aiResult.data?.text?.trim()) {
      reply = aiResult.data.text.trim();
    } else {
      reply = `### Financial Analysis Summary

Regarding your query: **"${message}"**

${detectedTicker ? `**Detected Asset:** \`${detectedTicker}\`\n` : ""}
- **Fundamental Outlook:** Markets are currently prioritizing companies with strong free cash flow yields and manageable leverage multiples.
- **Valuation Check:** Ensure that current forward P/E is aligned with sector averages and historical 5-year medians.
- **Risk Assessment:** Keep stop-losses disciplined and verify quarterly earnings acceleration before initiating fresh allocations.

*Note: For live detailed technical breakdown and AI scorecards, visit the Technical Predictor and Research tabs.*`;
    }

    return ok({
      success: true,
      data: {
        reply,
        detectedTicker,
      },
    });
  } catch (error) {
    return internalError(
      error instanceof Error ? error.message : "Failed to process financial assistant request"
    );
  }
}
