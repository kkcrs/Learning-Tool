import { getGithubTop15 } from "@/lib/github-trends";
import { GithubTopStarsChart } from "@/components/github-trends/GithubTrendCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function GithubTopStarsSection() {
  const top15 = await getGithubTop15();

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 编程领域 Star 总数 Top 15</CardTitle>
        <p className="text-sm text-muted-foreground">
          数据来源：GitHub Search，筛选 Agent / LLM / 代码助手 / 开发提效类仓库
        </p>
      </CardHeader>
      <CardContent>
        <GithubTopStarsChart data={top15} />
      </CardContent>
    </Card>
  );
}
