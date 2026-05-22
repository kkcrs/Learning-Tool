"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserProfile } from "@/lib/auth";
import { studySessionSchema } from "@/lib/validators";
import { bilibiliSearchUrl, isAllowedVideoUrl } from "@/lib/web-search";
import { findLearningVideo } from "@/server/ai/search-learning-video";
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

/** 视频学习计时结束后保存（客户端计时条调用） */
export async function saveTimedStudySession(input: {
  subjectId: string;
  knowledgePointId?: string;
  durationMinutes: number;
  description?: string;
}) {
  const { profile } = await getUserProfile();
  const parsed = studySessionSchema.safeParse({
    subjectId: input.subjectId,
    knowledgePointId: input.knowledgePointId,
    durationMinutes: input.durationMinutes,
    description: input.description,
  });

  if (!parsed.success) {
    return { error: "保存失败，请检查学习时长" };
  }

  await prisma.studySession.create({
    data: {
      userId: profile.userId,
      subjectId: parsed.data.subjectId,
      knowledgePointId: parsed.data.knowledgePointId ?? null,
      durationMinutes: parsed.data.durationMinutes,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/study");
  return { success: true as const };
}

export const getWeeklyStudyStats = cache(async (): Promise<WeeklyStudyItem[]> => {
  const { profile } = await getUserProfile();
  const monday = startOfWeek(new Date());
  const sessions = await prisma.studySession.findMany({
    where: {
      userId: profile.userId,
      date: { gte: monday },
    },
    select: {
      date: true,
      durationMinutes: true,
      subject: { select: { name: true, icon: true } },
    },
  });

  const days: WeeklyStudyItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i];
    const daySessions = sessions.filter(
      (s) => s.date.toISOString().slice(0, 10) === key
    );

    const bySubject = new Map<
      string,
      { subjectName: string; icon: string; minutes: number }
    >();
    for (const s of daySessions) {
      const name = s.subject.name;
      const cur = bySubject.get(name) ?? {
        subjectName: name,
        icon: s.subject.icon,
        minutes: 0,
      };
      cur.minutes += s.durationMinutes;
      bySubject.set(name, cur);
    }

    const subjects = [...bySubject.values()].sort(
      (a, b) => b.minutes - a.minutes
    );
    const minutes = subjects.reduce((sum, s) => sum + s.minutes, 0);

    days.push({ date: key, label, minutes, subjects });
  }
  return days;
});

export const getSubjectDistribution = cache(async (): Promise<
  SubjectDistributionItem[]
> => {
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
});

/** 科目列表页：只查科目与知识点数量，不加载整棵树 */
export const getSubjectList = cache(async () => {
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
});

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

export const getRecentSessions = cache(async (limit = 5) => {
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
});

/** 点击知识点：AI 联网搜索并返回第三方学习视频链接 */
export async function openKnowledgePointVideo(params: {
  subjectId: string;
  knowledgePointId: string;
}) {
  const { profile } = await getUserProfile();

  const kp = await prisma.knowledgePoint.findUnique({
    where: { id: params.knowledgePointId },
    include: {
      subject: true,
      parent: { select: { name: true } },
    },
  });

  if (!kp || kp.subjectId !== params.subjectId) {
    return { error: "知识点不存在" };
  }

  try {
    const video = await findLearningVideo(
      kp.subject.name,
      kp.name,
      kp.parent?.name,
      profile.grade
    );

    let url = video.url;
    if (!isAllowedVideoUrl(url)) {
      const keyword = `${kp.subject.name} ${kp.parent?.name ?? ""} ${kp.name}`.trim();
      url = bilibiliSearchUrl(keyword);
    }

    return {
      success: true as const,
      url,
      title: video.title,
      source: video.source,
    };
  } catch (e) {
    console.error("[openKnowledgePointVideo]", e);
    return { error: "搜索学习视频失败，请稍后重试" };
  }
}
