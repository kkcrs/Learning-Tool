import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createStudySession } from "@/server/actions/study";
import { PageBackLink } from "@/components/layout/PageBackLink";
import { StudyRecordForm } from "@/components/study/StudyRecordForm";

export default async function StudyRecordPage({
  params,
  searchParams,
}: {
  params: { subjectId: string };
  searchParams: { kp?: string };
}) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: {
      knowledgePoints: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: { children: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!subject) notFound();

  async function saveSession(formData: FormData) {
    "use server";
    formData.set("subjectId", params.subjectId);
    const res = await createStudySession(formData);
    if (res.success) redirect("/dashboard");
  }

  const points = subject.knowledgePoints.flatMap((p) => [
    { id: p.id, name: p.name },
    ...p.children.map((c) => ({ id: c.id, name: c.name })),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageBackLink
        href={`/study/${subject.id}`}
        label={`返回${subject.name}`}
      />
      <h1 className="text-2xl font-bold">
        {subject.icon} 记录学习 · {subject.name}
      </h1>
      <StudyRecordForm
        subjectId={subject.id}
        knowledgePoints={points}
        defaultKpId={searchParams.kp}
        saveAction={saveSession}
      />
    </div>
  );
}
