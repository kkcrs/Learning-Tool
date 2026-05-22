import { Suspense } from "react";
import { getStudyPlan } from "@/server/actions/plan";
import { PlanAiSection } from "@/components/dashboard/PlanAiSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function PlanSection() {
  const { plans, summary } = await getStudyPlan();

  return (
    <>
      <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        基于你的学习数据：{summary}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.subject}>
            <CardHeader>
              <CardTitle>{plan.subject}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="font-medium">重点：</span>
                {plan.focus}
              </p>
              <p>
                <span className="font-medium">本周目标：</span>
                {plan.weeklyMinutes} 分钟
              </p>
              <ul className="list-inside list-disc text-muted-foreground">
                {plan.tasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <Suspense
        fallback={
          <div className="flex items-center gap-3 py-4">
            <span className="loader-ring h-5 w-5 rounded-full border-2 border-transparent border-t-primary border-r-secondary" />
            <p className="text-sm text-muted-foreground">AI 个性化计划生成中…</p>
          </div>
        }
      >
        <PlanAiSection />
      </Suspense>
    </>
  );
}
