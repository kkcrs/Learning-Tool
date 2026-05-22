import { Suspense } from "react";
import Link from "next/link";
import { getWeeklyStudyStats } from "@/server/actions/study";
import { AiAdviceSection } from "@/components/dashboard/AiAdviceSection";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardRecent } from "@/components/dashboard/DashboardRecent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/content-loading";

function ChartSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ContentSkeleton className="h-[280px] lg:col-span-1" />
      <ContentSkeleton className="h-[280px] lg:col-span-1" />
      <ContentSkeleton className="h-[280px] lg:col-span-2" />
    </div>
  );
}

export default async function DashboardPage() {
  const weekly = await getWeeklyStudyStats();
  const weekTotal = weekly.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            学习<span className="text-primary">仪表盘</span>
          </h1>
          <p className="text-muted-foreground">本周已学习 {weekTotal} 分钟</p>
        </div>
        <div className="flex gap-2">
          <Link href="/study">
            <Button className="btn-gradient h-10 rounded-2xl px-5 shadow-md shadow-primary/25">
              记录学习
            </Button>
          </Link>
          <Link href="/quiz/setup">
            <Button
              variant="outline"
              className="h-10 rounded-2xl border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              开始自测
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <DashboardCharts />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>AI 学习建议</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center gap-3 py-2">
                <span className="loader-ring h-5 w-5 rounded-full border-2 border-transparent border-t-primary border-r-secondary" />
                <p className="text-sm text-muted-foreground">AI 分析生成中…</p>
              </div>
            }
          >
            <AiAdviceSection />
          </Suspense>
        </CardContent>
      </Card>

      <Suspense
        fallback={<ContentSkeleton className="h-[200px]" />}
      >
        <DashboardRecent />
      </Suspense>
    </div>
  );
}
