import { prisma } from "@/database/prisma";
import { historyService } from "@/services/history-service";
import type { ResearchResult } from "@/types/research";
import { logError, logInfo, logWarning } from "@/lib/logger";

interface CompanyRecordLike {
  id: string;
}

export class ReportService {
  async saveResearchReport(result: ResearchResult, userId?: string) {
    try {
      logInfo("Persisting research report", { ticker: result.ticker, userId });

      const companyRecord = (await prisma.company.upsert({
        where: { ticker: result.company.ticker },
        update: {
          name: result.company.name,
          sector: result.company.sector,
          industry: result.company.industry,
          exchange: result.company.exchange,
          description: result.company.description,
        },
        create: {
          ticker: result.company.ticker,
          name: result.company.name,
          sector: result.company.sector,
          industry: result.company.industry,
          exchange: result.company.exchange,
          description: result.company.description,
        },
      })) as CompanyRecordLike;

      const researchRecord = await prisma.researchReport.create({
        data: {
          ticker: result.ticker,
          companyId: companyRecord.id,
          userId,
          recommendation: result.recommendation.value,
          confidence: result.recommendation.confidence,
          summary: result.summary,
          sentimentScore: result.sentiment.score,
          riskScore: result.risk.score,
          financialMetrics: result.financials,
          newsSnapshot: result.news,
        },
      });

      await historyService.create({
        ticker: result.ticker,
        companyName: result.company.name,
        recommendation: result.recommendation.value,
        score: Math.round(result.confidenceBreakdown.overallRecommendation * 100),
        userId,
      });

      logInfo("Research history entry created", { ticker: result.ticker, userId });
      return researchRecord;
    } catch (error) {
      logError("ReportService.saveResearchReport failed", {
        error,
        ticker: result.ticker,
      });
      logWarning("Continuing without persistence", { ticker: result.ticker });
      throw error;
    }
  }
}

export const reportService = new ReportService();
