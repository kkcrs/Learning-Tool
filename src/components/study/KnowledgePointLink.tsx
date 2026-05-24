"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { openKnowledgePointVideo } from "@/server/actions/study";
import { useKnowledgePointVideoSearch } from "@/components/study/knowledge-point-video-context";
import { cn } from "@/lib/utils";

type KnowledgePointLinkProps = {
  subjectId: string;
  knowledgePointId: string;
  name: string;
  className?: string;
};

export function KnowledgePointLink({
  subjectId,
  knowledgePointId,
  name,
  className,
}: KnowledgePointLinkProps) {
  const { busyId, setBusyId, showReadyVideo, dismissReadyVideo, readyVideo } =
    useKnowledgePointVideoSearch();
  const [error, setError] = useState("");

  const loading = busyId === knowledgePointId;
  const disabled = busyId !== null;
  const isReady =
    readyVideo?.knowledgePointId === knowledgePointId && !loading;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setBusyId(knowledgePointId);
    setError("");
    dismissReadyVideo();

    try {
      const res = await openKnowledgePointVideo({
        subjectId,
        knowledgePointId,
      });

      if (res.success && res.url) {
        const { url, title, source } = res;
        // 延迟展示，与本次点击彻底分离
        window.setTimeout(() => {
          showReadyVideo({
            url,
            title,
            knowledgePointId,
            knowledgePointName: name,
            isDirectVideo: source === "bilibili-video",
          });
        }, 100);
        return;
      }

      setError(res.error ?? "未找到视频");
    } catch {
      setError("搜索学习视频失败，请稍后重试");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <span
      className={cn(
        "inline-flex flex-col items-start gap-0.5",
        disabled && !loading && "cursor-not-allowed",
        loading && "cursor-wait"
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={
          disabled && !loading
            ? "正在搜索其他知识点视频，请稍候"
            : loading
              ? "正在联网搜索 B 站视频…"
              : "点击搜索该知识点的 B 站学习视频"
        }
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
          isReady
            ? "border-primary bg-primary/20 text-primary shadow-sm ring-2 ring-primary/30"
            : "border-primary/25 bg-primary/10 text-primary hover:border-primary/40 hover:bg-primary/20 hover:shadow-sm",
          "disabled:pointer-events-none disabled:opacity-50",
          loading && "disabled:opacity-70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        ) : (
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
        )}
        {name}
        {isReady && (
          <span className="ml-0.5 text-[10px] font-normal opacity-80">
            · 待打开
          </span>
        )}
      </button>
      {error && (
        <span className="px-1 text-[10px] text-destructive">{error}</span>
      )}
    </span>
  );
}
