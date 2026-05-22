import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuizAttempt } from "@/server/actions/quiz";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Button } from "@/components/ui/button";

export default async function QuizResultPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  if (!searchParams.id) notFound();

  const attempt = await getQuizAttempt(searchParams.id);
  if (!attempt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {attempt.subject.icon} {attempt.subject.name} · 测验结果
      </h1>
      <QuizResult
        score={attempt.score}
        total={attempt.total}
        analysis={attempt.aiAnalysis ?? "暂无分析"}
      />
      <div className="flex gap-2">
        <Link href="/quiz/setup">
          <Button>再测一次</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">返回仪表盘</Button>
        </Link>
      </div>
    </div>
  );
}
