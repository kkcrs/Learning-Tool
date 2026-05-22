import { PageBackLink } from "@/components/layout/PageBackLink";
import { QuizSessionClient } from "@/components/quiz/QuizSessionClient";

export default function QuizSessionPage() {
  return (
    <div className="space-y-4">
      <PageBackLink href="/quiz/setup" label="返回自测设置" />
      <h1 className="text-2xl font-bold">答题中</h1>
      <QuizSessionClient />
    </div>
  );
}
