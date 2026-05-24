import { ContentSkeleton } from "@/components/ui/content-loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GithubTrendsGrowthSkeleton() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-background px-8 py-6 shadow-lg">
          <span className="loader-ring h-8 w-8 rounded-full border-2 border-transparent border-t-primary border-r-secondary" />
          <p className="text-sm font-medium text-foreground">正在加载增速数据…</p>
        </div>
      </div>

      <Card className="opacity-60">
        <CardHeader>
          <ContentSkeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <ContentSkeleton className="h-[400px]" />
        </CardContent>
      </Card>
    </div>
  );
}
