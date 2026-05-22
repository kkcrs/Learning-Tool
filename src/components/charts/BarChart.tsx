"use client";

import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyStudyItem } from "@/types";

export function WeeklyBarChart({ data }: { data: WeeklyStudyItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsBar data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="分" />
        <Tooltip formatter={(v) => [`${v} 分钟`, "学习时长"]} />
        <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}
