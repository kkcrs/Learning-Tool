"use client";

import { Suspense } from "react";
import { GithubPeriodFilter } from "@/components/github-trends/GithubPeriodFilter";

function FilterFallback() {
  return (
    <div className="inline-flex h-10 w-[140px] animate-pulse rounded-xl bg-muted" />
  );
}

/** useSearchParams 需包在 Suspense 内，否则筛选按钮不渲染 */
export function GithubPeriodFilterShell() {
  return (
    <Suspense fallback={<FilterFallback />}>
      <GithubPeriodFilter />
    </Suspense>
  );
}
