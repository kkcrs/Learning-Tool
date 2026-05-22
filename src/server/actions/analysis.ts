"use server";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { getUserProfile } from "@/lib/auth";
import { analyzeWeaknessWithAi } from "@/server/ai/analyze-weakness";
import type { WeaknessItem } from "@/types";

const groupKey = (subjectId: string, kpId: string | null) =>
  `${subjectId}:${kpId ?? "none"}`;

export const getWeaknessData = cache(async (): Promise<WeaknessItem[]> => {
  const { profile } = await getUserProfile();

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: profile.userId },
    select: {
      subjectId: true,
      knowledgePointId: true,
      score: true,
      total: true,
    },
  });

  const quizMap = new Map<
    string,
    { scores: number[]; count: number }
  >();
  for (const a of attempts) {
    const k = groupKey(a.subjectId, a.knowledgePointId);
    const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
    const cur = quizMap.get(k) ?? { scores: [], count: 0 };
    cur.scores.push(pct);
    cur.count += 1;
    quizMap.set(k, cur);
  }

  const studyStats = await prisma.studySession.groupBy({
    by: ["subjectId", "knowledgePointId"],
    where: { userId: profile.userId },
    _sum: { durationMinutes: true },
  });

  const subjects = await prisma.subject.findMany();
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const quizStats = Array.from(quizMap.entries()).map(([k, v]) => {
    const [subjectId, kpPart] = k.split(":");
    return {
      subjectId,
      knowledgePointId: kpPart === "none" ? null : kpPart,
      avgScore: Math.round(
        v.scores.reduce((a, b) => a + b, 0) / v.scores.length
      ),
      attemptCount: v.count,
    };
  });

  const kpIds = Array.from(
    new Set(
      quizStats.map((x) => x.knowledgePointId).filter(Boolean) as string[]
    )
  );
  const kps = await prisma.knowledgePoint.findMany({
    where: { id: { in: kpIds } },
  });
  const kpMap = new Map(kps.map((k) => [k.id, k.name]));

  const studyMap = new Map(
    studyStats.map((s) => [
      groupKey(s.subjectId, s.knowledgePointId),
      s._sum.durationMinutes ?? 0,
    ])
  );

  const items: WeaknessItem[] = quizStats.map((q) => {
    const subject = subjectMap.get(q.subjectId);
    const kpName = q.knowledgePointId
      ? kpMap.get(q.knowledgePointId) ?? null
      : null;

    return {
      subjectName: subject?.name ?? "未知",
      knowledgePointName: kpName,
      avgScore: q.avgScore,
      attemptCount: q.attemptCount,
      studyMinutes: studyMap.get(groupKey(q.subjectId, q.knowledgePointId)) ?? 0,
    };
  });

  return items.sort((a, b) => a.avgScore - b.avgScore);
});

export async function getWeaknessAiAdvice() {
  const { profile } = await getUserProfile();
  const items = await getWeaknessData();
  if (items.length === 0) {
    return "暂无测验数据。请先完成自测，系统才能分析薄弱点。";
  }
  return analyzeWeaknessWithAi(items, profile.grade);
}
