"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type VideoSearchContextValue = {
  busyId: string | null;
  setBusyId: (id: string | null) => void;
};

const VideoSearchContext = createContext<VideoSearchContextValue | null>(null);

export function KnowledgePointVideoProvider({ children }: { children: ReactNode }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  return (
    <VideoSearchContext.Provider value={{ busyId, setBusyId }}>
      {children}
    </VideoSearchContext.Provider>
  );
}

export function useKnowledgePointVideoSearch() {
  const ctx = useContext(VideoSearchContext);
  if (!ctx) {
    throw new Error(
      "useKnowledgePointVideoSearch must be used within KnowledgePointVideoProvider"
    );
  }
  return ctx;
}
