"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { useKnowledgePointVideoSearch } from "@/components/study/knowledge-point-video-context";
import { useStudyTimer } from "@/components/study/study-timer-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 搜索完成后底部气泡：必须用户第二次点击才 window.open，
 * 与第一次点击错开，避免误触或浏览器拦截。
 */
export function VideoReadyPrompt() {
  const { readyVideo, dismissReadyVideo } = useKnowledgePointVideoSearch();
  const { startVideoStudy, session } = useStudyTimer();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readyVideo) {
      setVisible(false);
      return;
    }
    // 与首次点击错开，防止气泡上的按钮吃掉同一次点击
    const t = window.setTimeout(() => setVisible(true), 200);
    return () => window.clearTimeout(t);
  }, [readyVideo]);

  if (!readyVideo || !visible || typeof document === "undefined") {
    return null;
  }

  const bottom = session ? "bottom-28" : "bottom-4";

  function handleOpenClick() {
    const url = readyVideo!.url;
    startVideoStudy({
      knowledgePointId: readyVideo!.knowledgePointId,
      knowledgePointName: readyVideo!.knowledgePointName,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    dismissReadyVideo();
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="关闭"
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[1px]"
        onClick={dismissReadyVideo}
      />
      <div
        role="dialog"
        aria-labelledby="video-ready-title"
        className={cn(
          "fixed left-4 right-4 z-[101] mx-auto max-w-md",
          "rounded-2xl border-2 border-primary/40 bg-background p-4 shadow-2xl",
          "md:left-[15rem] md:right-6",
          bottom
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              id="video-ready-title"
              className="text-base font-semibold text-foreground"
            >
              视频已准备好
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {readyVideo.knowledgePointName}
              {readyVideo.isDirectVideo
                ? " · 具体教学视频"
                : " · B 站搜索结果"}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissReadyVideo}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-foreground/90">
          {readyVideo.title}
        </p>

        <p className="mb-4 rounded-xl bg-primary/10 px-3 py-2.5 text-xs leading-relaxed text-foreground">
          请再点一次下方按钮打开 B 站（不会自动跳转）。
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="btn-gradient h-11 flex-1 rounded-xl border-0 text-white hover:opacity-90"
            onClick={handleOpenClick}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            打开 B 站视频
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={dismissReadyVideo}
          >
            暂不打开
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
