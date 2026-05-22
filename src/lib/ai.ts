import OpenAI from "openai";
import { z } from "zod";

/** DeepSeek 兼容 OpenAI SDK */
export const DEEPSEEK_MODEL =
  process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL:
    process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com",
});

export function assertDeepSeekConfigured(): void {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    throw new Error("未配置 DEEPSEEK_API_KEY");
  }
}

/** 带结构化输出的通用调用 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodSchema<T>,
  model: string = DEEPSEEK_MODEL
): Promise<T> {
  assertDeepSeekConfigured();

  const response = await deepseek.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("AI 返回为空");

  try {
    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  } catch (e) {
    throw new Error(
      `AI 输出格式异常: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}
