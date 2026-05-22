import { deepseek, DEEPSEEK_MODEL } from "@/lib/ai";
import type { WeaknessItem } from "@/types";

export async function analyzeWeaknessWithAi(
  items: WeaknessItem[],
  grade: number
): Promise<string> {
  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content:
          "你是小学学习规划师。根据薄弱点数据，用简体中文给出分科目改进建议与本周学习重点，条理清晰，300字以内。",
      },
      {
        role: "user",
        content: JSON.stringify({ grade, weaknesses: items }),
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "暂时无法生成建议，请稍后重试。"
  );
}
