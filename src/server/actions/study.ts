"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserProfile } from "@/lib/auth";
import { studySessionSchema } from "@/lib/validators";
import type { SubjectDistributionItem, WeeklyStudyItem } from "@/types";

function startOfWeek(d: Date) {
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - day + 1);
  return monday;
}

export async function createStudySession(formData: FormData) {
  const { profile } = await getUserProfile();
  const parsed = studySessionSchema.safeParse({
    subjectId: formData.get("subjectId"),
    knowledgePointId: formData.get("knowledgePointId") || undefined,
    durationMinutes: formData.get("durationMinutes"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await prisma.studySession.create({
    data: {
      userId: profile.userId,
      ...parsed.data,
      knowledgePointId: parsed.data.knowledgePointId ?? null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/study");
  return { success: true };
}

export async function getWeeklyStudyStats(): Promise<WeeklyStudyItem[]> {
  const { profile } = await getUserProfile();
  const monday = startOfWeek(new Date());
  const sessions = await prisma.studySession.findMany({
    where: {
      userId: profile.userId,
      date: { gte: monday },
    },
    select: { date: true, durationMinutes: true },
  });

  const days: WeeklyStudyItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i];
    const minutes = sessions
      .filter((s) => s.date.toISOString().slice(0, 10) === key)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    days.push({ date: key, label, minutes });
  }
  return days;
}

export async function getSubjectDistribution(): Promise<
  SubjectDistributionItem[]
> {
  const { profile } = await getUserProfile();
  const grouped = await prisma.studySession.groupBy({
    by: ["subjectId"],
    where: { userId: profile.userId },
    _sum: { durationMinutes: true },
  });

  const subjects = await prisma.subject.findMany();
  const map = new Map(subjects.map((s) => [s.id, s]));

  return grouped
    .map((g) => {
      const subject = map.get(g.subjectId);
      if (!subject) return null;
      return {
        subjectId: g.subjectId,
        subjectName: subject.name,
        icon: subject.icon,
        minutes: g._sum.durationMinutes ?? 0,
      };
    })
    .filter(Boolean) as SubjectDistributionItem[];
}

/** 科目列表页：只查科目与知识点数量，不加载整棵树 */
export async function getSubjectList() {
  const { profile } = await getUserProfile();
  const grade = profile.grade;

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      _count: {
        select: {
          knowledgePoints: {
            where: { parentId: null, grade: { lte: grade } },
          },
        },
      },
    },
  });

  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    knowledgePointCount: s._count.knowledgePoints,
  }));
}

/** 测验设置等需要知识点树时使用 */
export async function getSubjectsWithPoints(grade?: number) {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      knowledgePoints: {
        where: grade ? { grade: { lte: grade }, parentId: null } : { parentId: null },
        orderBy: [{ grade: "asc" }, { order: "asc" }],
        include: { children: { orderBy: { order: "asc" } } },
      },
    },
  });

  return subjects;
}

export async function getRecentSessions(limit = 5) {
  const { profile } = await getUserProfile();
  return prisma.studySession.findMany({
    where: { userId: profile.userId },
    orderBy: { date: "desc" },
    take: limit,
    include: {
      subject: true,
      knowledgePoint: true,
    },
  });
}
