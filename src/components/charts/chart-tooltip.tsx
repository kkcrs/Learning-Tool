"use client";

import type { TooltipProps } from "recharts";

const boxClass =
  "rounded-lg border bg-background px-3 py-2 text-sm shadow-md";

export function WeeklyStudyTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.[0]) return null;

  const row = payload[0].payload as {
    label: string;
    minutes: number;
    subjects?: { subjectName: string; icon: string; minutes: number }[];
  };

  return (
    <div className={boxClass}>
      <p className="font-medium text-foreground">{row.label}</p>
      <p className="text-muted-foreground">合计 {row.minutes} 分钟</p>
      {row.subjects && row.subjects.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 border-t border-border pt-1.5">
          {row.subjects.map((s) => (
            <li key={s.subjectName} className="text-foreground">
              {s.icon} {s.subjectName}：{s.minutes} 分钟
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">暂无科目记录</p>
      )}
    </div>
  );
}

export function SubjectDistributionTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.[0]) return null;

  const row = payload[0].payload as { name: string; value: number };

  return (
    <div className={boxClass}>
      <p className="font-medium text-foreground">{row.name}</p>
      <p className="text-primary">{row.value} 分钟</p>
    </div>
  );
}
