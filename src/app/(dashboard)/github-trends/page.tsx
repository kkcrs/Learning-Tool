import { Suspense } from "react";
import type { GithubTrendPeriod } from "@/lib/github-trends";
import { GithubGrowthChartSection } from "@/components/github-trends/GithubGrowthChartSection";
import { GithubTopStarsSection } from "@/components/github-trends/GithubTopStarsSection";
import { GithubTrendsAnalysisSection } from "@/components/github-trends/GithubTrendsAnalysisSection";
import { GithubTrendsAnalysisSkeleton } from "@/components/github-trends/GithubTrendsAnalysisSkeleton";
import { GithubTrendsGrowthSkeleton } from "@/components/github-trends/GithubTrendsGrowthSkeleton";
import { GithubTopStarsSkeleton } from "@/components/github-trends/GithubTopStarsSkeleton";

export default function GithubTrendsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period: GithubTrendPeriod =
    searchParams.period === "monthly" ? "monthly" : "weekly";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">GitHub 趋势分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          聚焦 AI 编程、Agent 与开发者提效工具（如 OpenClaw、MCP、Copilot 类项目）
        </p>
      </div>

      <Suspense fallback={<GithubTopStarsSkeleton />}>
        <GithubTopStarsSection />
      </Suspense>

      <Suspense key={period} fallback={<GithubTrendsGrowthSkeleton />}>
        <GithubGrowthChartSection period={period} />
      </Suspense>

      <Suspense key={`analysis-${period}`} fallback={<GithubTrendsAnalysisSkeleton />}>
        <GithubTrendsAnalysisSection period={period} />
      </Suspense>
    </div>
  );
}
