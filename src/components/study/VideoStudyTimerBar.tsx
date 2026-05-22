"use client";

import { Loader2 } from "lucide-react";
import { useStudyTimer } from "@/components/study/study-timer-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VideoStudyTimerBar() {
  const { session, elapsedSeconds, togglePause, cancelStudy, endAndSave, saving } =
    useStudyTimer();

  if (!session) return null;

  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const ss = String(elapsedSeconds % 60).padStart(2, "0");
  const canSave = elapsedSeconds >= 60;

  async function handleSave() {
    const res = await endAndSave();
    if (res.error) alert(res.error);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-background/95 p-4 shadow-lg backdrop-blur-md md:left-[15rem] md:right-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">正在计时学习</p>
          <p className="truncate font-medium">
            {session.subjectIcon} {session.subjectName} ·{" "}
            {session.knowledgePointName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            观看 B 站视频期间持续计时；返回本页后「结束并保存」，放弃记录请点「取消」
          </p>
        </div>
        <p className="font-mono text-3xl tabular-nums text-primary">
          {mm}:{ss}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-xl"
            onClick={togglePause}
            disabled={saving}
          >
            {session.running ? "暂停" : "继续"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={cancelStudy}
            disabled={saving}
          >
            取消
          </Button>
          <span
            className={cn(
              "inline-flex",
              !canSave && !saving && "cursor-not-allowed"
            )}
          >
            <Button
              type="button"
              size="sm"
              variant={canSave ? "default" : "outline"}
              className={cn(
                "min-w-[6.5rem] shrink-0 whitespace-nowrap rounded-xl px-3",
                canSave &&
                  !saving &&
                  "btn-gradient border-0 text-white hover:opacity-90",
                !canSave &&
                  "border-border bg-muted text-foreground disabled:opacity-100 disabled:pointer-events-none"
              )}
              onClick={handleSave}
              disabled={!canSave || saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "结束并保存"
              )}
            </Button>
          </span>
        </div>
      </div>
      {!canSave && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          至少学习 1 分钟才可保存
        </p>
      )}
    </div>
  );
}
