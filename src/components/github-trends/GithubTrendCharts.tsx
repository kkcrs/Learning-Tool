"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GithubGrowthRepo, GithubTopRepo } from "@/lib/github-trends";
import { shortRepoName } from "@/lib/github-trends";

function formatAxisStars(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export function GithubTopStarsChart({ data }: { data: GithubTopRepo[] }) {
  const chartData = [...data].reverse().map((d) => ({
    label: shortRepoName(d.fullName),
    value: d.stars,
    fullName: d.fullName,
    stars: d.stars,
    language: d.language,
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(480, chartData.length * 18)}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickFormatter={formatAxisStars}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={108}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const row = payload[0].payload as GithubTopRepo & { label: string };
            return (
              <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                <p className="font-medium">{row.fullName}</p>
                <p className="text-primary">⭐ {row.stars.toLocaleString()}</p>
                {row.language && (
                  <p className="text-muted-foreground">语言：{row.language}</p>
                )}
              </div>
            );
          }}
        />
        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GithubGrowthChart({ data }: { data: GithubGrowthRepo[] }) {
  const chartData = [...data]
    .filter((d) => d.starsGained > 0)
    .reverse()
    .map((d) => ({
      label: shortRepoName(d.fullName),
      value: d.starsGained,
      ...d,
    }));

  if (chartData.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        暂无增速数据
      </p>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(400, chartData.length * 22)}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          horizontal={false}
        />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={108}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const row = payload[0].payload as GithubGrowthRepo & {
              label: string;
            };
            return (
              <div className="max-w-xs rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                <p className="font-medium">{row.fullName}</p>
                {row.stars > 0 && (
                  <p className="text-foreground/80">
                    总 Star：{row.stars.toLocaleString()}
                  </p>
                )}
                <p className="text-primary">
                  增量 +{row.starsGained.toLocaleString()}（{row.periodLabel}）
                </p>
                {row.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.description}
                  </p>
                )}
              </div>
            );
          }}
        />
        <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
