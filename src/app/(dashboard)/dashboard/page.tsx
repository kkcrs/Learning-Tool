import { Suspense } from "react";
import Link from "next/link";
import {
  getRecentSessions,
  getSubjectDistribution,
  getWeeklyStudyStats,
} from "@/server/actions/study";
import { getWeaknessData } from "@/server/actions/analysis";
import { AiAdviceSection } from "@/components/dashboard/AiAdviceSection";
import { WeeklyBarChart } from "@/components/charts/BarChart";
import { SubjectRingChart } from "@/components/charts/RingChart";
import { WeaknessRadarChart } from "@/components/charts/RadarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [weekly, distribution, recent, weaknesses] = await Promise.all([
    getWeeklyStudyStats(),
    getSubjectDistribution(),
    getRecentSessions(5),
    getWeaknessData(),
  ]);

  const weekTotal = weekly.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">学习仪表盘</h1>
          <p className="text-muted-foreground">本周已学习 {weekTotal} 分钟</p>
        </div>
        <div className="flex gap-2">
          <Link href="/study">
            <Button>记录学习</Button>
          </Link>
          <Link href="/quiz/setup">
            <Button variant="outline">开始自测</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>本周学习时长</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyBarChart data={weekly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>科目时间分布</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectRingChart data={distribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>薄弱点雷达（得分率）</CardTitle>
          </CardHeader>
          <CardContent>
            <WeaknessRadarChart data={weaknesses} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI 学习建议</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">AI 分析生成中…</p>
              }
            >
              <AiAdviceSection />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近学习</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无记录，去记录一次学习吧</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>
                    {s.subject.icon} {s.subject.name}
                    {s.knowledgePoint ? ` · ${s.knowledgePoint.name}` : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {s.durationMinutes} 分钟 ·{" "}
                    {new Date(s.date).toLocaleDateString("zh-CN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
