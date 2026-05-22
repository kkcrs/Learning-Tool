import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SubjectStudyPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const { profile } = await getUserProfile();
  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: {
      knowledgePoints: {
        where: { parentId: null, grade: { lte: profile.grade } },
        orderBy: [{ order: "asc" }],
        include: { children: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!subject) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{subject.icon}</span>
        <h1 className="text-2xl font-bold">{subject.name}</h1>
      </div>
      <Link href={`/study/${subject.id}/record`}>
        <Button>开始计时学习</Button>
      </Link>
      <div className="grid gap-3">
        {subject.knowledgePoints.map((kp) => (
          <Card key={kp.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{kp.name}</CardTitle>
            </CardHeader>
            {kp.children.length > 0 && (
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {kp.children.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {c.name}
                  </span>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
