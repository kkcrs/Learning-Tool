import { Suspense } from "react";
import { PlanSection } from "@/components/dashboard/PlanSection";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">学习计划</h1>
      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-16 rounded-lg bg-muted" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-40 rounded-xl bg-muted" />
              <div className="h-40 rounded-xl bg-muted" />
              <div className="h-40 rounded-xl bg-muted" />
            </div>
          </div>
        }
      >
        <PlanSection />
      </Suspense>
    </div>
  );
}
