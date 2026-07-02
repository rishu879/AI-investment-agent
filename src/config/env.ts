import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd(), true);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid database URL").optional(),
  JWT_SECRET: z.string().min(10).optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required").optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  YAHOO_FINANCE_BASE_URL: z.string().url().default("https://query1.finance.yahoo.com"),
  TAVILY_API_KEY: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
  throw new Error(`[env] Invalid environment configuration: ${issues}`);
}

export const env = {
  ...parsed.data,
  DATABASE_URL: parsed.data.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres",
  JWT_SECRET: parsed.data.JWT_SECRET ?? "ai-investment-agent-secret",
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY ?? "",
};
