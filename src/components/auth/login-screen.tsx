"use client";

import { motion } from "framer-motion";
import { FloatingElements } from "@/components/auth/floating-elements";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginFormCard } from "@/components/auth/login-form-card";

const WAVE_PRIMARY = "oklch(0.65 0.22 340 / 0.12)";
const WAVE_SECONDARY = "oklch(0.85 0.15 200 / 0.18)";

type LoginScreenProps = {
  error?: string;
  info?: string;
  email?: string;
  unconfirmed?: string;
};

export function LoginScreen(props: LoginScreenProps) {
  return (
    <main className="relative h-dvh max-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />

      <FloatingElements />

      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center gap-4 overflow-hidden px-4 py-4 lg:flex-row lg:gap-12 lg:px-8">
        <LoginBrandPanel />
        <LoginFormCard {...props} />
      </div>

      {/* 底部波浪：使用 oklch 实色，避免 fill-primary/10 在 SVG 上渲染成黑色 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-40 overflow-hidden">
        <svg
          className="absolute bottom-0 h-40 w-full"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M0,90 C360,130 720,60 1080,100 C1260,120 1380,80 1440,90 L1440,140 L0,140 Z"
            fill={WAVE_SECONDARY}
            animate={{
              d: [
                "M0,90 C360,130 720,60 1080,100 C1260,120 1380,80 1440,90 L1440,140 L0,140 Z",
                "M0,100 C360,60 720,120 1080,80 C1260,100 1380,110 1440,100 L1440,140 L0,140 Z",
                "M0,90 C360,130 720,60 1080,100 C1260,120 1380,80 1440,90 L1440,140 L0,140 Z",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,70 C240,140 480,0 720,70 C960,140 1200,0 1440,70 L1440,140 L0,140 Z"
            fill={WAVE_PRIMARY}
            animate={{
              d: [
                "M0,70 C240,140 480,0 720,70 C960,140 1200,0 1440,70 L1440,140 L0,140 Z",
                "M0,90 C240,20 480,120 720,50 C960,90 1200,70 1440,90 L1440,140 L0,140 Z",
                "M0,70 C240,140 480,0 720,70 C960,140 1200,0 1440,70 L1440,140 L0,140 Z",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </main>
  );
}
