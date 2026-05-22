"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { saveTimedStudySession } from "@/server/actions/study";

const STORAGE_KEY = "learningTool_activeStudy";

export type ActiveStudySession = {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  knowledgePointId: string;
  knowledgePointName: string;
  startedAt: number;
  accumulatedMs: number;
  running: boolean;
};

type StudyTimerContextValue = {
  session: ActiveStudySession | null;
  elapsedSeconds: number;
  startVideoStudy: (params: {
    knowledgePointId: string;
    knowledgePointName: string;
  }) => void;
  togglePause: () => void;
  cancelStudy: () => void;
  endAndSave: () => Promise<{ error?: string }>;
  saving: boolean;
};

const StudyTimerContext = createContext<StudyTimerContextValue | null>(null);

function getElapsedMs(s: ActiveStudySession) {
  if (!s.running) return s.accumulatedMs;
  return s.accumulatedMs + (Date.now() - s.startedAt);
}

function loadStored(subjectId: string): ActiveStudySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveStudySession;
    return parsed.subjectId === subjectId ? parsed : null;
  } catch {
    return null;
  }
}

function persist(session: ActiveStudySession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function StudyTimerProvider({
  subjectId,
  subjectName,
  subjectIcon,
  children,
}: {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = loadStored(subjectId);
    if (stored) setSession(stored);
  }, [subjectId]);

  useEffect(() => {
    if (!session) {
      setElapsedSeconds(0);
      return;
    }
    const tick = () => {
      setElapsedSeconds(Math.floor(getElapsedMs(session) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  const startVideoStudy = useCallback(
    (params: { knowledgePointId: string; knowledgePointName: string }) => {
      const next: ActiveStudySession = {
        subjectId,
        subjectName,
        subjectIcon,
        knowledgePointId: params.knowledgePointId,
        knowledgePointName: params.knowledgePointName,
        startedAt: Date.now(),
        accumulatedMs: 0,
        running: true,
      };
      setSession(next);
      persist(next);
    },
    [subjectId, subjectName, subjectIcon]
  );

  const togglePause = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      let next: ActiveStudySession;
      if (prev.running) {
        next = {
          ...prev,
          running: false,
          accumulatedMs: getElapsedMs(prev),
          startedAt: Date.now(),
        };
      } else {
        next = {
          ...prev,
          running: true,
          startedAt: Date.now(),
        };
      }
      persist(next);
      return next;
    });
  }, []);

  const cancelStudy = useCallback(() => {
    setSession(null);
    persist(null);
    setElapsedSeconds(0);
  }, []);

  const endAndSave = useCallback(async () => {
    if (!session) return { error: "没有进行中的学习" };
    const ms = getElapsedMs(session);
    if (ms < 60_000) {
      return { error: "至少学习 1 分钟才可保存" };
    }
    const minutes = Math.max(1, Math.ceil(ms / 60_000));
    setSaving(true);
    try {
      const res = await saveTimedStudySession({
        subjectId: session.subjectId,
        knowledgePointId: session.knowledgePointId,
        durationMinutes: minutes,
        description: `观看 B 站视频：${session.knowledgePointName}`,
      });
      if ("error" in res && res.error) {
        return { error: res.error };
      }
      setSession(null);
      persist(null);
      router.refresh();
      return {};
    } finally {
      setSaving(false);
    }
  }, [session, router]);

  return (
    <StudyTimerContext.Provider
      value={{
        session,
        elapsedSeconds,
        startVideoStudy,
        togglePause,
        cancelStudy,
        endAndSave,
        saving,
      }}
    >
      {children}
    </StudyTimerContext.Provider>
  );
}

export function useStudyTimer() {
  const ctx = useContext(StudyTimerContext);
  if (!ctx) {
    throw new Error("useStudyTimer must be used within StudyTimerProvider");
  }
  return ctx;
}
