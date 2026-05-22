"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SubjectDistributionItem } from "@/types";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export function SubjectRingChart({ data }: { data: SubjectDistributionItem[] }) {
  const chartData = data.map((d) => ({
    name: `${d.icon} ${d.subjectName}`,
    value: d.minutes,
  }));

  if (chartData.length === 0) {
    return (
      <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        暂无学习记录
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${v} 分钟`, "时长"]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
