"use client";

import { useState } from "react";
import { StudyTimer } from "@/components/study/StudyTimer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StudyRecordForm({
  subjectId,
  knowledgePoints,
  defaultKpId,
  saveAction,
}: {
  subjectId: string;
  knowledgePoints: { id: string; name: string }[];
  defaultKpId?: string;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const [minutes, setMinutes] = useState<number | null>(null);
  const [kpId, setKpId] = useState(defaultKpId ?? "");

  if (minutes === null) {
    return <StudyTimer onFinish={setMinutes} />;
  }

  return (
    <form action={saveAction} className="space-y-4 rounded-xl border p-6">
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="durationMinutes" value={minutes} />
      {kpId && <input type="hidden" name="knowledgePointId" value={kpId} />}

      <p className="text-center text-lg font-medium">本次学习 {minutes} 分钟</p>

      <div className="space-y-2">
        <Label>知识点（可选）</Label>
        <select
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={kpId}
          onChange={(e) => setKpId(e.target.value)}
        >
          <option value="">不指定</option>
          {knowledgePoints.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">学了什么</Label>
        <Input
          id="description"
          name="description"
          placeholder="例：完成了分数加减法练习"
        />
      </div>

      <Button type="submit" className="w-full">
        保存记录
      </Button>
    </form>
  );
}
