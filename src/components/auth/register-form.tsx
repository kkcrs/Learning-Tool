"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encryptForServer } from "@/lib/crypto";
import { registerSecure } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const grade = Number(formData.get("grade"));
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    // Client-side validation
    if (!name || name.length < 1) {
      setError("请输入姓名");
      setPending(false);
      return;
    }
    if (!email) {
      setError("请输入邮箱");
      setPending(false);
      return;
    }
    if (!password || password.length < 6) {
      setError("密码至少 6 位");
      setPending(false);
      return;
    }
    if (!grade || grade < 1 || grade > 6) {
      setError("请选择年级");
      setPending(false);
      return;
    }

    try {
      // Encrypt password with RSA public key — only the server can decrypt
      const encryptedPassword = await encryptForServer(password);
      const result = await registerSecure({
        email,
        encryptedPassword,
        name,
        grade,
      });

      if ("error" in result) {
        setError(result.error);
        setPending(false);
        return;
      }

      if (result.info) {
        // Email confirmation required
        router.push(
          "/login?info=" + encodeURIComponent(result.info)
        );
      } else {
        // Signed in immediately
        router.refresh();
        router.push(result.redirect);
      }
    } catch {
      setError("网络异常，请稍后重试");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册账号</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">年级</Label>
              <select
                id="grade"
                name="grade"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={3}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    {g} 年级
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "注册中…" : "注册"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link href="/login" className="text-primary underline">
              登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
