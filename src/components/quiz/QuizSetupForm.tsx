"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { startQuiz } from "@/server/actions/quiz";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SubjectOption = {
  id: string;
  name: string;
  icon: string;
  knowledgePoints: {
    id: string;
    name: string;
    children: { id: string; name: string }[];
  }[];
};

export function QuizSetupForm({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [kpId, setKpId] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subject = subjects.find((s) => s.id === subjectId);
  const points = subject?.knowledgePoints ?? [];
  const childPoints = points.flatMap((p) => [
    { id: p.id, name: p.name },
    ...p.children.map((c) => ({ id: c.id, name: `  └ ${c.name}` })),
  ]);

  async function handleStart() {
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.set("subjectId", subjectId);
    if (kpId) fd.set("knowledgePointId", kpId);
    fd.set("questionCount", String(count));

    const res = await startQuiz(fd);
    setLoading(false);

    if (res.success) {
      sessionStorage.setItem("quiz-session", JSON.stringify(res));
      router.push("/quiz/session");
    } else {
      setError(res.error ?? "出题失败");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-2">
        <Label>科目</Label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setKpId("");
          }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>知识点（可选）</Label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={kpId}
          onChange={(e) => setKpId(e.target.value)}
        >
          <option value="">不指定</option>
          {childPoints.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>题目数量</Label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {[3, 5, 8, 10].map((n) => (
            <option key={n} value={n}>
              {n} 题
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" onClick={handleStart} disabled={loading || !subjectId}>
        {loading ? "AI 出题中…" : "开始自测"}
      </Button>
    </div>
  );
}
