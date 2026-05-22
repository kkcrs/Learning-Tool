"use server";

import { getUserProfile } from "@/lib/auth";
import { getWeaknessData } from "@/server/actions/analysis";
import { generateStudyPlan } from "@/server/ai/generate-plan";
import type { StudyPlanItem } from "@/types";

export async function getStudyPlan(): Promise<{
  plans: StudyPlanItem[];
  summary: string;
}> {
  const { profile } = await getUserProfile();
  const weaknesses = await getWeaknessData();

  const summary =
    weaknesses.length > 0
      ? weaknesses
          .slice(0, 5)
          .map(
            (w) =>
              `${w.subjectName}${w.knowledgePointName ? `-${w.knowledgePointName}` : ""} 平均${w.avgScore}分`
          )
          .join("；")
      : "暂无历史数据，按基础节奏安排语数英均衡学习。";

  try {
    const plans = await generateStudyPlan({
      grade: profile.grade,
      name: profile.name,
      summary,
    });
    return { plans, summary };
  } catch {
    return {
      summary,
      plans: [
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
      ],
    };
  }
}
