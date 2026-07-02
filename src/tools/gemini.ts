import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "@/config/env";

export async function generateNarrative(prompt: string) {
  if (!env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      temperature: 0.2,
    });

    const response = await model.invoke(prompt);
    return typeof response.content === "string" ? response.content : String(response.content);
  } catch {
    return null;
  }
}
