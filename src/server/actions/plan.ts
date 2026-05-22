"use server";

import { getUserProfile } from "@/lib/auth";
import { getWeaknessData } from "@/server/actions/analysis";
import { generateStudyPlan } from "@/server/ai/generate-plan";
import type { StudyPlanItem } from "@/types";

function buildSummary(weaknesses: Awaited<ReturnType<typeof getWeaknessData>>) {
  if (weaknesses.length === 0) {
    return "暂无历史数据，按基础节奏安排语数英均衡学习。";
  }
  return weaknesses
    .slice(0, 5)
    .map(
      (w) =>
        `${w.subjectName}${w.knowledgePointName ? `-${w.knowledgePointName}` : ""} 平均${w.avgScore}分`
    )
    .join("；");
}

const DEFAULT_PLANS: StudyPlanItem[] = [
  {
    subject: "数学",
    focus: "每日计算练习",
    weeklyMinutes: 90,
    tasks: ["完成 10 道计算题", "复习本周知识点"],
  },
  {
    subject: "语文",
    focus: "阅读与字词",
    weeklyMinutes: 60,
    tasks: ["朗读 15 分钟", "摘抄 3 个好词"],
  },
  {
    subject: "英语",
    focus: "单词与句型",
    weeklyMinutes: 45,
    tasks: ["背诵 10 个单词", "完成 5 道选择题"],
  },
];

/** 快速加载：仅数据库统计 + 默认计划，不调用 AI */
export async function getStudyPlan() {
  const weaknesses = await getWeaknessData();
  return {
    plans: DEFAULT_PLANS,
    summary: buildSummary(weaknesses),
  };
}

/** 流式区块：AI 个性化计划（较慢，单独 Suspense） */
export async function getStudyPlanFromAi(): Promise<StudyPlanItem[] | null> {
  const { profile } = await getUserProfile();
  const weaknesses = await getWeaknessData();
  const summary = buildSummary(weaknesses);

  try {
    return await generateStudyPlan({
      grade: profile.grade,
      name: profile.name,
      summary,
    });
  } catch {
    return null;
  }
}
