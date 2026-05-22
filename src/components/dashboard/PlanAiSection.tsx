import { getStudyPlanFromAi } from "@/server/actions/plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudyPlanItem } from "@/types";

function PlanCards({ plans }: { plans: StudyPlanItem[] }) {
  return (
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
  );
}

export async function PlanAiSection() {
  const aiPlans = await getStudyPlanFromAi();

  if (!aiPlans?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        AI 计划暂不可用，已显示上方默认安排。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-primary">AI 个性化计划</p>
      <PlanCards plans={aiPlans} />
    </div>
  );
}
