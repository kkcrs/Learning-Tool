/** 种子数据类型（AI 生成或缓存 JSON 共用） */

export type KnowledgePointSeed = {
  name: string;
  grade: number;
  order: number;
  children?: KnowledgePointSeed[];
};

export type SubjectSeed = {
  name: string;
  icon: string;
  knowledgePoints: KnowledgePointSeed[];
};

export type CurriculumSeed = {
  region: string;
  subjects: SubjectSeed[];
};
