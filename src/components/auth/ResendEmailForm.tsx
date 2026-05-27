"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResendEmailForm({ defaultEmail }: { defaultEmail?: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();

    if (!email) {
      setMessage("请填写邮箱");
      setPending(false);
      return;
    }

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        if (error.message.includes("rate") || error.message.includes("limit")) {
          setMessage("请求过于频繁，请稍后再试");
        } else {
          setMessage("发送失败，请稍后重试");
        }
        setIsSuccess(false);
      } else {
        setMessage("验证邮件已重新发送，请查收 QQ 邮箱（含垃圾箱）");
        setIsSuccess(true);
      }
    } catch {
      setMessage("网络异常，请稍后重试");
      setIsSuccess(false);
    }

    setPending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
    >
      <p className="text-xs text-amber-900">
        注册已成功，但需先验证邮箱才能登录。没收到邮件可点击下方重发。
      </p>
      <Input
        name="email"
        type="email"
        defaultValue={defaultEmail}
        placeholder="注册邮箱"
        required
      />
      {message && (
        <p className={`text-xs ${isSuccess ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={pending}
      >
        {pending ? "发送中…" : "重新发送验证邮件"}
      </Button>
    </form>
  );
}
