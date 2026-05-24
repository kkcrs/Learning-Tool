import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserProfile } from "@/lib/auth";
import { PageBackLink } from "@/components/layout/PageBackLink";
import { SubjectKnowledgePoints } from "@/components/study/SubjectKnowledgePoints";
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
        include: {
          children: {
            where: { grade: { lte: profile.grade } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!subject) notFound();

  return (
    <div className="space-y-6">
      <PageBackLink href="/study" label="返回科目列表" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl">{subject.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{subject.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            点击知识点搜索视频，准备好后请按底部提示再点一次打开 B 站；打开后开始计时
          </p>
        </div>
      </div>

      <Link href={`/study/${subject.id}/record?autoStart=1`}>
        <Button
          variant="outline"
          className="rounded-2xl border-primary/30 hover:bg-primary/10"
        >
          开始计时学习
        </Button>
      </Link>

      <div className="grid gap-3">
        {subject.knowledgePoints.length === 0 && (
          <p className="rounded-2xl border border-dashed border-primary/30 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            当前年级（{profile.grade} 年级）下暂无「{subject.name}」知识点。
            {subject.name === "英语"
              ? " 广东省多数学校从三年级系统开设英语；若你是一二年级，请确认已执行 npm run db:seed 更新数据，或联系管理员调整年级。"
              : " 请执行 npm run db:seed 同步课程标准，或检查个人资料中的年级设置。"}
          </p>
        )}
        <SubjectKnowledgePoints
          subjectId={subject.id}
          subjectName={subject.name}
          subjectIcon={subject.icon}
          knowledgePoints={subject.knowledgePoints}
        />
      </div>
    </div>
  );
}
