"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GithubTrendPeriod } from "@/lib/github-trends";

const options: { value: GithubTrendPeriod; label: string }[] = [
  { value: "weekly", label: "近一周" },
  { value: "monthly", label: "近一月" },
];

export function GithubPeriodFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = (searchParams.get("period") === "monthly"
    ? "monthly"
    : "weekly") as GithubTrendPeriod;

  function selectPeriod(period: GithubTrendPeriod) {
    if (period === current || isPending) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-xl border border-primary/20 bg-muted/40 p-1">
        {options.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={isPending}
              onClick={() => selectPeriod(opt.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-60",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {isPending && (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          加载中…
        </span>
      )}
    </div>
  );
}
