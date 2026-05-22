import { deepseek, DEEPSEEK_MODEL } from "@/lib/ai";
import type { QuizQuestion } from "@/types";

export async function generateQuestions(params: {
  subjectName: string;
  knowledgePointName?: string;
  grade: number;
  count: number;
}): Promise<QuizQuestion[]> {
  const topic = params.knowledgePointName ?? params.subjectName;

  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "你是小学数学老师。只输出 JSON：{ \"questions\": [{ \"question\": \"\", \"options\": [\"A\",\"B\",\"C\",\"D\"], \"correctAnswer\": \"与某选项完全一致\", \"type\": \"single\" }] }。题目难度适合中国小学，单选题为主。",
      },
      {
        role: "user",
        content: `科目：${params.subjectName}，知识点：${topic}，年级：${params.grade}年级，出${params.count}道题。`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { questions?: QuizQuestion[] };
  const questions = parsed.questions ?? [];

  if (questions.length === 0) {
    throw new Error("AI 未返回有效题目");
  }

  return questions.slice(0, params.count);
}
