"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ReadyVideo = {
  url: string;
  title: string;
  knowledgePointId: string;
  knowledgePointName: string;
  isDirectVideo: boolean;
};

type VideoSearchContextValue = {
  busyId: string | null;
  setBusyId: (id: string | null) => void;
  readyVideo: ReadyVideo | null;
  showReadyVideo: (video: ReadyVideo) => void;
  dismissReadyVideo: () => void;
};

const VideoSearchContext = createContext<VideoSearchContextValue | null>(null);

export function KnowledgePointVideoProvider({ children }: { children: ReactNode }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [readyVideo, setReadyVideo] = useState<ReadyVideo | null>(null);

  const showReadyVideo = useCallback((video: ReadyVideo) => {
    setReadyVideo(video);
  }, []);

  const dismissReadyVideo = useCallback(() => {
    setReadyVideo(null);
  }, []);

  return (
    <VideoSearchContext.Provider
      value={{
        busyId,
        setBusyId,
        readyVideo,
        showReadyVideo,
        dismissReadyVideo,
      }}
    >
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
