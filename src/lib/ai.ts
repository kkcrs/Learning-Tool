import OpenAI from 'openai';
import { z } from 'zod';

// DeepSeek 完全兼容 OpenAI SDK
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

// 带结构化输出的通用调用
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodSchema<T>,
  model: string = 'deepseek-v4-pro'
): Promise<T> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error('AI 返回为空');

  try {
    const parsed = JSON.parse(raw);
    return schema.parse(parsed); // Zod 验证
  } catch (e) {
    throw new Error(`AI 输出格式异常: ${e}`);
  }
}

