import Link from "next/link";
import { getSubjectList } from "@/server/actions/study";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function QuizPage() {
  const subjects = await getSubjectList();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI 自测</h1>
      <p className="text-muted-foreground">选择科目，由 AI 生成题目并自动判分</p>
      <Link href="/quiz/setup">
        <Button>配置并开始自测</Button>
      </Link>
      <div className="grid gap-4 sm:grid-cols-3">
        {subjects.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>
                {s.icon} {s.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">支持按知识点出题</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
