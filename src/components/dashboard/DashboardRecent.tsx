import Link from "next/link";
import { getRecentSessions } from "@/server/actions/study";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function DashboardRecent() {
  const recent = await getRecentSessions(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近学习</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            暂无记录，去记录一次学习吧
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((s) => (
              <li
                key={s.id}
                className="flex justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span>
                  {s.subject.icon} {s.subject.name}
                  {s.knowledgePoint ? ` · ${s.knowledgePoint.name}` : ""}
                </span>
                <span className="text-muted-foreground">
                  {s.durationMinutes} 分钟 ·{" "}
                  {new Date(s.date).toLocaleDateString("zh-CN")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/study"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          查看全部学习记录 →
        </Link>
      </CardContent>
    </Card>
  );
}
