import { getWeaknessAiAdvice } from "@/server/actions/analysis";

export async function AiAdviceSection() {
  const aiAdvice = await getWeaknessAiAdvice();

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiAdvice}</p>
  );
}
