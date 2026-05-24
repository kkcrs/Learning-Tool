"use client";

import { KnowledgePointLink } from "@/components/study/KnowledgePointLink";
import { KnowledgePointVideoProvider } from "@/components/study/knowledge-point-video-context";
import { StudyTimerProvider } from "@/components/study/study-timer-context";
import { VideoReadyPrompt } from "@/components/study/VideoReadyPrompt";
import { VideoSearchOverlay } from "@/components/study/VideoSearchOverlay";
import { VideoStudyTimerBar } from "@/components/study/VideoStudyTimerBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SubjectKnowledgePoint = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

type SubjectKnowledgePointsProps = {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  knowledgePoints: SubjectKnowledgePoint[];
};

function KnowledgePointCards({
  subjectId,
  knowledgePoints,
}: Pick<SubjectKnowledgePointsProps, "subjectId" | "knowledgePoints">) {
  return (
    <div className="grid gap-3">
      {knowledgePoints.map((kp) => (
        <Card key={kp.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {kp.children.length > 0 ? (
                <span>{kp.name}</span>
              ) : (
                <KnowledgePointLink
                  subjectId={subjectId}
                  knowledgePointId={kp.id}
                  name={kp.name}
                  className="text-sm"
                />
              )}
            </CardTitle>
          </CardHeader>
          {kp.children.length > 0 && (
            <CardContent className="flex flex-wrap gap-2 pt-0">
              {kp.children.map((c) => (
                <KnowledgePointLink
                  key={c.id}
                  subjectId={subjectId}
                  knowledgePointId={c.id}
                  name={c.name}
                />
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export function SubjectKnowledgePoints({
  subjectId,
  subjectName,
  subjectIcon,
  knowledgePoints,
}: SubjectKnowledgePointsProps) {
  return (
    <StudyTimerProvider
      subjectId={subjectId}
      subjectName={subjectName}
      subjectIcon={subjectIcon}
    >
      <KnowledgePointVideoProvider>
        <div className="pb-36">
          <KnowledgePointCards
            subjectId={subjectId}
            knowledgePoints={knowledgePoints}
          />
        </div>
        <VideoSearchOverlay />
        <VideoReadyPrompt />
        <VideoStudyTimerBar />
      </KnowledgePointVideoProvider>
    </StudyTimerProvider>
  );
}
