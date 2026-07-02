import { z } from "zod";

export const researchRequestSchema = z.object({
  ticker: z.string().trim().min(1).max(10),
  userId: z.string().trim().min(1).max(100).optional(),
});

export const reportRequestSchema = researchRequestSchema;

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authSignupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const historyEntrySchema = z.object({
  ticker: z.string().trim().min(1).max(10),
  companyName: z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
  score: z.number().min(0).max(100),
});

export const historyQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return 1;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 1 : parsed;
  }, z.number().int().min(1).default(1)),
  pageSize: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return 8;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 8 : parsed;
  }, z.number().int().min(1).max(50).default(8)),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const tickerParamSchema = z.object({
  ticker: z.string().trim().min(1).max(10),
});
