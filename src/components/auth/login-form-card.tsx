"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  Star,
  Zap,
} from "lucide-react";
import { login } from "@/server/actions/auth";
import { ResendEmailForm } from "@/components/auth/ResendEmailForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-14 w-full rounded-2xl text-base font-bold shadow-lg hover:shadow-xl"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          登录中…
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          开始学习
          <ArrowRight className="h-5 w-5" />
        </span>
      )}
    </Button>
  );
}

type LoginFormCardProps = {
  error?: string;
  info?: string;
  email?: string;
  unconfirmed?: string;
};

export function LoginFormCard({
  error,
  info,
  email,
  unconfirmed,
}: LoginFormCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const showResend = unconfirmed === "1";

  return (
    <motion.div
      className="relative w-full max-w-md"
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
    >
      <motion.div
        className="absolute -right-6 -top-6"
        animate={{ rotate: [0, 20, 0], y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Star className="h-8 w-8 fill-primary/30 text-primary" />
      </motion.div>
      <motion.div
        className="absolute -bottom-4 -left-4 text-primary"
        animate={{ rotate: [0, -20, 0], y: [0, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <Heart className="h-6 w-6 fill-primary/30 stroke-primary" />
      </motion.div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-secondary/20 blur-2xl" />

        <motion.div
          className="relative z-10 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">开启学习之旅</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            欢迎回来！
          </h2>
          <p className="text-muted-foreground">登录开始今天的学习冒险</p>
        </motion.div>

        <form action={login} className="relative z-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              邮箱地址
            </Label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                  focusedField === "email" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={email}
                placeholder="your@email.com"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="h-14 rounded-2xl border-2 bg-background/50 pl-12 focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              密码
            </Label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                  focusedField === "password"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="输入你的密码"
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="h-14 rounded-2xl border-2 bg-background/50 pl-12 pr-12 focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {info && <p className="text-sm text-green-600">{info}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <span className="cursor-pointer text-sm font-medium text-primary hover:underline">
              忘记密码？
            </span>
          </div>

          <SubmitButton />
        </form>

        {showResend && <ResendEmailForm defaultEmail={email} />}

        <div className="relative z-10 my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="px-2 text-sm text-muted-foreground">或者</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { icon: "🐧", name: "QQ" },
            { icon: "💬", name: "微信" },
            { icon: "🐦", name: "微博" },
          ].map((social) => (
            <button
              key={social.name}
              type="button"
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-border bg-background/50 p-4 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-muted/50"
            >
              <span className="text-2xl">{social.icon}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {social.name}
              </span>
            </button>
          ))}
        </div>

        <p className="relative z-10 mt-6 text-center text-sm text-muted-foreground">
          还没有账号？{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
