import { deepseek, DEEPSEEK_MODEL } from "@/lib/ai";
import type { QuizQuestion } from "@/types";

export async function analyzeMistakes(params: {
  subjectName: string;
  questions: QuizQuestion[];
  userAnswers: string[];
  score: number;
  total: number;
}): Promise<string> {
  const wrongItems = params.questions
    .map((q, i) => ({
      question: q.question,
      correct: q.correctAnswer,
      user: params.userAnswers[i] ?? "",
    }))
    .filter((x) => x.user !== x.correct);

  if (wrongItems.length === 0) {
    return "全部答对，表现优秀！建议保持每日练习，巩固已掌握知识点。";
  }

  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content:
          "你是耐心的小学学习教练。根据错题用简体中文给出：1) 错因分析 2) 复习建议 3) 一条鼓励。控制在 200 字以内。",
      },
      {
        role: "user",
        content: JSON.stringify({
          subject: params.subjectName,
          score: `${params.score}/${params.total}`,
          mistakes: wrongItems,
        }),
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "暂时无法生成分析，请稍后重试。"
  );
}
