import {
  getSubjectDistribution,
  getWeeklyStudyStats,
} from "@/server/actions/study";
import { getWeaknessData } from "@/server/actions/analysis";
import { WeeklyBarChart } from "@/components/charts/BarChart";
import { SubjectRingChart } from "@/components/charts/RingChart";
import { WeaknessRadarChart } from "@/components/charts/RadarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function DashboardCharts() {
  const [weekly, distribution, weaknesses] = await Promise.all([
    getWeeklyStudyStats(),
    getSubjectDistribution(),
    getWeaknessData(),
  ]);

  return (
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>薄弱点雷达（得分率）</CardTitle>
        </CardHeader>
        <CardContent>
          <WeaknessRadarChart data={weaknesses} />
        </CardContent>
      </Card>
    </div>
  );
}
