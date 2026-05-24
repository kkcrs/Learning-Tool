import { ContentSkeleton } from "@/components/ui/content-loading";

export default function GithubTrendsLoading() {
  return (
    <div className="space-y-6">
      <ContentSkeleton className="h-10 w-72" />
      <ContentSkeleton className="h-[520px]" />
      <ContentSkeleton className="h-[480px]" />
      <ContentSkeleton className="h-[360px]" />
    </div>
  );
}
