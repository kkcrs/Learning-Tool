"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserProfile } from "@/lib/auth";
import { quizSetupSchema, quizSubmitSchema } from "@/lib/validators";
import { generateQuestions } from "@/server/ai/generate-questions";
import { analyzeMistakes } from "@/server/ai/analyze-mistakes";
import type { QuizQuestion } from "@/types";

export async function startQuiz(formData: FormData) {
  const { profile } = await getUserProfile();
  const parsed = quizSetupSchema.safeParse({
    subjectId: formData.get("subjectId"),
    knowledgePointId: formData.get("knowledgePointId") || undefined,
    questionCount: formData.get("questionCount"),
  });

  if (!parsed.success) {
    return { error: "参数无效" };
  }

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
  });
  if (!subject) return { error: "科目不存在" };

  let knowledgePointName: string | undefined;
  if (parsed.data.knowledgePointId) {
    const kp = await prisma.knowledgePoint.findUnique({
      where: { id: parsed.data.knowledgePointId },
    });
    knowledgePointName = kp?.name;
  }

  try {
    const questions = await generateQuestions({
      subjectName: subject.name,
      knowledgePointName,
      grade: profile.grade,
      count: parsed.data.questionCount,
    });

    return {
      success: true as const,
      subjectId: parsed.data.subjectId,
      knowledgePointId: parsed.data.knowledgePointId,
      subjectName: subject.name,
      questions,
    };
  } catch (e) {
    console.error("[startQuiz] generateQuestions failed:", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("DEEPSEEK_API_KEY")) {
      return {
        error: "未配置 AI 密钥，请在项目根目录 .env 中设置 DEEPSEEK_API_KEY",
      };
    }
    if (msg.includes("401") || msg.toLowerCase().includes("authentication")) {
      return { error: "AI 密钥无效，请检查 DEEPSEEK_API_KEY" };
    }
    if (msg.includes("model") || msg.includes("404")) {
      return {
        error: `AI 模型不可用，请检查 .env 中 DEEPSEEK_MODEL（当前：${process.env.DEEPSEEK_MODEL ?? "deepseek-chat"}）`,
      };
    }
    return { error: "AI 出题失败，请稍后重试" };
  }
}

export async function submitQuiz(payload: {
  subjectId: string;
  knowledgePointId?: string;
  questions: QuizQuestion[];
  userAnswers: string[];
  score: number;
  total: number;
}) {
  const { profile } = await getUserProfile();
  const parsed = quizSubmitSchema.safeParse(payload);
  if (!parsed.success) return { error: "提交数据无效" };

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
  });
  if (!subject) return { error: "科目不存在" };

  const aiAnalysis = await analyzeMistakes({
    subjectName: subject.name,
    questions: parsed.data.questions,
    userAnswers: parsed.data.userAnswers,
    score: parsed.data.score,
    total: parsed.data.total,
  });

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: profile.userId,
      subjectId: parsed.data.subjectId,
      knowledgePointId: parsed.data.knowledgePointId ?? null,
      questions: parsed.data.questions,
      userAnswers: parsed.data.userAnswers,
      score: parsed.data.score,
      total: parsed.data.total,
      aiAnalysis,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quiz");

  return {
    success: true as const,
    attemptId: attempt.id,
    aiAnalysis,
  };
}

export async function getQuizAttempt(attemptId: string) {
  const { profile } = await getUserProfile();
  return prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId: profile.userId },
    include: { subject: true, knowledgePoint: true },
  });
}
