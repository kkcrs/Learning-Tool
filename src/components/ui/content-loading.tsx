import { cn } from "@/lib/utils";

type ContentLoadingProps = {
  label?: string;
  className?: string;
  /** 是否显示下方骨架块（整页加载用） */
  showSkeleton?: boolean;
};

export function ContentLoading({
  label = "加载中…",
  className,
  showSkeleton = true,
}: ContentLoadingProps) {
  return (
    <div
      className={cn(
        "flex min-h-[min(65vh,520px)] flex-col items-center justify-center gap-6 py-12",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-4 border-primary/15"
          aria-hidden
        />
        <span
          className="loader-ring absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary"
          aria-hidden
        />
        <span
          className="h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_oklch(0.65_0.22_340_/_0.5)]"
          aria-hidden
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {showSkeleton && (
        <div className="w-full max-w-2xl space-y-4 px-2">
          <div className="skeleton-shimmer h-8 w-2/5 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton-shimmer h-40 rounded-2xl" />
            <div className="skeleton-shimmer h-40 rounded-2xl" />
          </div>
          <div className="skeleton-shimmer h-28 rounded-2xl" />
        </div>
      )}
    </div>
  );
}

export function ContentSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-2xl", className)}
      aria-hidden
    />
  );
}
