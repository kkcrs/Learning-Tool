import Link from "next/link";
import { getSubjectList } from "@/server/actions/study";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudyPage() {
  const subjects = await getSubjectList();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">选择科目</h1>
      <p className="text-muted-foreground">
        选择科目后，点击知识点可打开 B 站学习视频；也可计时记录学习
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <Link key={s.id} href={`/study/${s.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{s.icon}</span>
                  {s.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {s.knowledgePointCount} 个知识点
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
