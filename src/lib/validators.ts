import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const registerSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
  name: z.string().min(1, "请输入姓名"),
  grade: z.coerce.number().int().min(1).max(6),
});

export const studySessionSchema = z.object({
  subjectId: z.string().uuid(),
  knowledgePointId: z.string().uuid().optional(),
  durationMinutes: z.coerce.number().int().min(1).max(480),
  description: z.string().max(500).optional(),
});

export const quizSetupSchema = z.object({
  subjectId: z.string().uuid(),
  knowledgePointId: z.string().uuid().optional(),
  questionCount: z.coerce.number().int().min(3).max(10),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  type: z.enum(["single", "multiple"]),
});

export const quizSubmitSchema = z.object({
  subjectId: z.string().uuid(),
  knowledgePointId: z.string().uuid().optional(),
  questions: z.array(quizQuestionSchema),
  userAnswers: z.array(z.string()),
  score: z.number().int(),
  total: z.number().int(),
});
