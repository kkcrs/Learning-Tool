import { ContentSkeleton } from "@/components/ui/content-loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GithubTopStarsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <ContentSkeleton className="h-6 w-56" />
        <ContentSkeleton className="mt-2 h-4 w-80" />
      </CardHeader>
      <CardContent>
        <ContentSkeleton className="h-[400px]" />
      </CardContent>
    </Card>
  );
}
