"use client";

import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useKnowledgePointVideoSearch } from "@/components/study/knowledge-point-video-context";

/** 搜索进行中全屏提示，避免用户以为已跳转 */
export function VideoSearchOverlay() {
  const { busyId } = useKnowledgePointVideoSearch();

  if (!busyId || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-background px-8 py-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">正在搜索 B 站视频…</p>
        <p className="text-xs text-muted-foreground">完成后会在底部提示您点击打开</p>
      </div>
    </div>,
    document.body
  );
}
