import { Suspense } from "react";
import { PlanSection } from "@/components/dashboard/PlanSection";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">学习计划</h1>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="skeleton-shimmer h-16 rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="skeleton-shimmer h-40 rounded-2xl" />
              <div className="skeleton-shimmer h-40 rounded-2xl" />
              <div className="skeleton-shimmer h-40 rounded-2xl" />
            </div>
          </div>
        }
      >
        <PlanSection />
      </Suspense>
    </div>
  );
}
