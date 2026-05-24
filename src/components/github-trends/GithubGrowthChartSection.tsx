import {
  getGithubTrendingGrowth,
  type GithubTrendPeriod,
} from "@/lib/github-trends";
import { GithubPeriodFilterShell } from "@/components/github-trends/GithubPeriodFilterShell";
import { GithubGrowthChart } from "@/components/github-trends/GithubTrendCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function GithubGrowthChartSection({
  period,
}: {
  period: GithubTrendPeriod;
}) {
  const growth = await getGithubTrendingGrowth(period);
  const periodText = period === "weekly" ? "近一周" : "近一月";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>AI 编程 Star 增速排行</CardTitle>
          <p className="text-sm text-muted-foreground">
            {periodText}内活跃的 AI / Agent / 代码提效类项目（GitHub Search +
            Trending 过滤）
          </p>
        </div>
        <GithubPeriodFilterShell />
      </CardHeader>
      <CardContent>
        <GithubGrowthChart data={growth} />
      </CardContent>
    </Card>
  );
}
