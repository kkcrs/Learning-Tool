import { QuizSessionClient } from "@/components/quiz/QuizSessionClient";

export default function QuizSessionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">答题中</h1>
      <QuizSessionClient />
    </div>
  );
}
