"use client";

import { KnowledgePointLink } from "@/components/study/KnowledgePointLink";
import { KnowledgePointVideoProvider } from "@/components/study/knowledge-point-video-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SubjectKnowledgePoint = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

type SubjectKnowledgePointsProps = {
  subjectId: string;
  knowledgePoints: SubjectKnowledgePoint[];
};

function KnowledgePointCards({
  subjectId,
  knowledgePoints,
}: SubjectKnowledgePointsProps) {
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

export function SubjectKnowledgePoints(props: SubjectKnowledgePointsProps) {
  return (
    <KnowledgePointVideoProvider>
      <KnowledgePointCards {...props} />
    </KnowledgePointVideoProvider>
  );
}
