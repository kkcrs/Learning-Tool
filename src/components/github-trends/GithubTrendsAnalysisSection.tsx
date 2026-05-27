import {
  buildTop10ForAnalysis,
  getGithubTop15,
  getGithubTrendingGrowth,
  type GithubTrendPeriod,
} from "@/lib/github-trends";
import { generateGithubTrendsAnalysis } from "@/server/ai/generate-github-trends-analysis";
import { GithubTrendsAnalysisView } from "@/components/github-trends/GithubTrendsAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function GithubTrendsAnalysisSection({
  period,
}: {
  period: GithubTrendPeriod;
}) {
  const periodText = period === "weekly" ? "近一周" : "近一月";
  const [top30, growth] = await Promise.all([
    getGithubTop15(),
    getGithubTrendingGrowth(period),
  ]);

  let analysis = null;
  let topStarsStats: Awaited<
    ReturnType<typeof buildTop10ForAnalysis>
  >["topStars"] = [];
  let topGrowthStats: Awaited<
    ReturnType<typeof buildTop10ForAnalysis>
  >["topGrowth"] = [];

  try {
    const built = await buildTop10ForAnalysis(top30, growth);
    topStarsStats = built.topStars;
    topGrowthStats = built.topGrowth;
    analysis = await generateGithubTrendsAnalysis({
      periodLabel: periodText,
      topStars: built.topStars,
      topGrowth: built.topGrowth,
    });
  } catch {
    analysis = null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 趋势解读</CardTitle>
        <p className="text-sm text-muted-foreground">
          基于当前榜单 Top 10 自动生成，切换「近一周 / 近一月」后会重新分析
        </p>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <GithubTrendsAnalysisView
            data={analysis}
            topStarsStats={topStarsStats}
            topGrowthStats={topGrowthStats}
            growthPeriodLabel={periodText}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            AI 分析暂不可用，请检查 DEEPSEEK_API_KEY 配置后刷新页面。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
