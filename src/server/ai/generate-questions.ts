import { assertDeepSeekConfigured, deepseek, DEEPSEEK_MODEL } from "@/lib/ai";
import type { QuizQuestion } from "@/types";

function normalizeQuestions(raw: unknown, count: number): QuizQuestion[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(list)) return [];

  const result: QuizQuestion[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const question = String(q.question ?? "").trim();
    const options = Array.isArray(q.options)
      ? q.options.map((o) => String(o).trim()).filter(Boolean)
      : [];
    const correctAnswer = String(q.correctAnswer ?? "").trim();
    const type = q.type === "multiple" ? "multiple" : "single";

    if (!question || options.length < 2 || !correctAnswer) continue;
    result.push({ question, options, correctAnswer, type });
    if (result.length >= count) break;
  }
  return result;
}

export async function generateQuestions(params: {
  subjectName: string;
  knowledgePointName?: string;
  grade: number;
  count: number;
}): Promise<QuizQuestion[]> {
  assertDeepSeekConfigured();

  const topic = params.knowledgePointName ?? params.subjectName;

  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          '你是小学数学老师。只输出 JSON：{ "questions": [{ "question": "题干", "options": ["A","B","C","D"], "correctAnswer": "必须与 options 中某项完全一致", "type": "single" }] }。题目难度适合中国小学，单选题为主。',
      },
      {
        role: "user",
        content: `科目：${params.subjectName}，知识点：${topic}，年级：${params.grade}年级，出${params.count}道题。`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("AI 返回为空");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI 返回的 JSON 无法解析");
  }

  const questions = normalizeQuestions(parsed, params.count);
  if (questions.length === 0) {
    throw new Error("AI 未返回有效题目");
  }

  return questions;
}
