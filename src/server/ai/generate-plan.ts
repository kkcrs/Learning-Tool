import { deepseek, DEEPSEEK_MODEL } from "@/lib/ai";
import type { StudyPlanItem } from "@/types";

export async function generateStudyPlan(params: {
  grade: number;
  name: string;
  summary: string;
}): Promise<StudyPlanItem[]> {
  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          '输出 JSON：{ "plans": [{ "subject": "数学", "focus": "重点", "weeklyMinutes": 60, "tasks": ["任务1"] }] }，覆盖 2-3 个科目，适合中国小学。',
      },
      {
        role: "user",
        content: `学生：${params.name}，${params.grade}年级。学习情况：${params.summary}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { plans?: StudyPlanItem[] };
  return parsed.plans ?? [];
}
