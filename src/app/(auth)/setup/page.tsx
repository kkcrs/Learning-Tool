import { redirect } from "next/navigation";
import Link from "next/link";
import { completeProfile } from "@/server/actions/auth";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (profile) redirect("/dashboard");

  const meta = user.user_metadata as { name?: string; grade?: number };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>完善学习资料</CardTitle>
          <p className="text-sm text-muted-foreground">
            账号已登录（{user.email}），请补充姓名和年级后即可使用
          </p>
        </CardHeader>
        <CardContent>
          <form action={completeProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={meta.name ?? ""}
                placeholder="例：萱萱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">年级</Label>
              <select
                id="grade"
                name="grade"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={meta.grade ?? 3}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    {g} 年级
                  </option>
                ))}
              </select>
            </div>
            {searchParams.error && (
              <p className="text-sm text-destructive">{searchParams.error}</p>
            )}
            <Button type="submit" className="w-full">
              保存并进入
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
