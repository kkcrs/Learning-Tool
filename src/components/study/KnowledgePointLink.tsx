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
  const { busyId, setBusyId } = useKnowledgePointVideoSearch();
  const [error, setError] = useState("");

  const loading = busyId === knowledgePointId;
  const disabled = busyId !== null;

  async function handleClick() {
    if (disabled) return;
    setBusyId(knowledgePointId);
    setError("");

    try {
      const res = await openKnowledgePointVideo({
        subjectId,
        knowledgePointId,
      });

      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
        return;
      }

      setError(res.error ?? "未找到视频");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={
          disabled && !loading
            ? "正在搜索其他知识点视频，请稍候"
            : "点击在 B 站搜索并打开该知识点的学习视频"
        }
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all",
          "hover:border-primary/40 hover:bg-primary/20 hover:shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          loading && "disabled:cursor-wait disabled:opacity-70",
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
      </button>
      {error && (
        <span className="px-1 text-[10px] text-destructive">{error}</span>
      )}
    </span>
  );
}
