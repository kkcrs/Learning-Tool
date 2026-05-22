import { getSubjectsWithPoints } from "@/server/actions/study";
import { getUserProfile } from "@/lib/auth";
import { PageBackLink } from "@/components/layout/PageBackLink";
import { QuizSetupForm } from "@/components/quiz/QuizSetupForm";

export default async function QuizSetupPage() {
  const { profile } = await getUserProfile();
  const subjects = await getSubjectsWithPoints(profile.grade);

  return (
    <div className="space-y-6">
      <PageBackLink href="/quiz" label="返回 AI 自测" />
      <h1 className="text-2xl font-bold">自测设置</h1>
      <p className="text-muted-foreground">选择科目、知识点与题量，AI 将生成试题</p>
      <QuizSetupForm subjects={subjects} />
    </div>
  );
}
