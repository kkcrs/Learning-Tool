"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuiz } from "@/server/actions/quiz";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/types";

type QuizPayload = {
  subjectId: string;
  knowledgePointId?: string;
  subjectName: string;
  questions: QuizQuestion[];
};

export function QuizSessionClient() {
  const router = useRouter();
  const [payload, setPayload] = useState<QuizPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quiz-session");
    if (!raw) {
      router.replace("/quiz/setup");
      return;
    }
    const data = JSON.parse(raw) as QuizPayload;
    setPayload(data);
    setAnswers(new Array(data.questions.length).fill(""));
  }, [router]);

  if (!payload) {
    return <p className="text-muted-foreground">加载题目中…</p>;
  }

  const current = payload.questions[index];
  const selected = answers[index] ?? "";

  const handleNext = async () => {
    if (!selected) return;
    if (index < payload.questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    let score = 0;
    payload.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score += 1;
    });

    const result = await submitQuiz({
      subjectId: payload.subjectId,
      knowledgePointId: payload.knowledgePointId,
      questions: payload.questions,
      userAnswers: answers,
      score,
      total: payload.questions.length,
    });

    setSubmitting(false);
    sessionStorage.removeItem("quiz-session");

    if (result.success) {
      router.push(`/quiz/result?id=${result.attemptId}`);
    } else {
      alert(result.error ?? "提交失败");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <QuizProgress current={index} total={payload.questions.length} />
      <QuestionCard
        question={current}
        index={index}
        total={payload.questions.length}
        selected={selected}
        onSelect={(a) => {
          const next = [...answers];
          next[index] = a;
          setAnswers(next);
        }}
      />
      <Button onClick={handleNext} disabled={!selected || submitting} className="w-full">
        {submitting
          ? "提交中…"
          : index === payload.questions.length - 1
            ? "提交答卷"
            : "下一题"}
      </Button>
    </div>
  );
}
