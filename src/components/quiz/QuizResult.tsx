import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuizResult({
  score,
  total,
  analysis,
}: {
  score: number;
  total: number;
  analysis: string;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>成绩</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {score} <span className="text-lg text-muted-foreground">/ {total}</span>
          </p>
          <p className="mt-2 text-muted-foreground">正确率 {pct}%</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>AI 错题分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{analysis}</p>
        </CardContent>
      </Card>
    </div>
  );
}
