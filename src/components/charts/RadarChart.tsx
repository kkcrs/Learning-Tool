"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { WeaknessItem } from "@/types";

export function WeaknessRadarChart({ data }: { data: WeaknessItem[] }) {
  const chartData = data.slice(0, 6).map((d) => ({
    subject: d.knowledgePointName
      ? `${d.subjectName}-${d.knowledgePointName}`
      : d.subjectName,
    score: d.avgScore,
  }));

  if (chartData.length === 0) {
    return (
      <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        暂无测验数据
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadar data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v) => [`${v}%`, "平均得分率"]} />
        <Radar
          name="得分率"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.4}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
