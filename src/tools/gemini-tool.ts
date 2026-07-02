import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "@/config/env";
import { BaseTool, ToolResult } from "@/tools/base";
import { withRetry } from "@/lib/retry";
import { logError, logInfo, logWarning } from "@/lib/logger";

export interface GeminiInput {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  text: string;
}

export class GeminiTool extends BaseTool<GeminiInput, GeminiResponse> {
  name = "GeminiTool";

  async execute(input: GeminiInput): Promise<ToolResult<GeminiResponse>> {
    if (!env.GEMINI_API_KEY) {
      logWarning("Gemini API key missing", { promptLength: input.prompt.length });
      return { ok: false, error: "Gemini API key is not configured" };
    }

    try {
      const model = new ChatGoogleGenerativeAI({
        apiKey: env.GEMINI_API_KEY,
        model: env.GEMINI_MODEL,
        temperature: input.temperature ?? 0.2,
      });

      const response = await withRetry(
        async () => {
          const result = await model.invoke(input.prompt);
          return typeof result.content === "string" ? result.content : String(result.content);
        },
        { retries: 2 }
      );

      logInfo("Gemini response received", { promptLength: input.prompt.length, responseLength: response.length });
      return { ok: true, data: { text: response } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gemini request failed";
      logError("Gemini tool failed", { error: message });
      return { ok: false, error: message };
    }
  }
}
