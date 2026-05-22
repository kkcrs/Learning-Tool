"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function StudyTimer({
  onFinish,
}: {
  onFinish: (minutes: number) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const minutes = Math.max(1, Math.ceil(seconds / 60));

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/30 p-8">
      <p className="text-5xl font-mono tabular-nums">
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setRunning((r) => !r)}
          variant={running ? "outline" : "default"}
        >
          {running ? "暂停" : "开始"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
        >
          重置
        </Button>
        <Button
          type="button"
          onClick={() => onFinish(minutes)}
          disabled={seconds < 60}
        >
          结束并保存
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">至少学习 1 分钟才可保存</p>
    </div>
  );
}
