"use client";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

export function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  selected: string;
  onSelect: (answer: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        第 {index + 1} / {total} 题
      </p>
      <h2 className="text-lg font-medium">{question.question}</h2>
      <div className="grid gap-2">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={cn(
              "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
              selected === opt
                ? "border-primary bg-primary/10"
                : "hover:bg-muted"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
