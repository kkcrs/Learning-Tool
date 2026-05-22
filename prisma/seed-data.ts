import { readFileSync, existsSync } from "fs";
import type { CurriculumSeed, KnowledgePointSeed, SubjectSeed } from "./seed-types";
import { getCurriculumCachePath } from "./generate-curriculum";

export type { CurriculumSeed, KnowledgePointSeed, SubjectSeed };

/** API 不可用时的最小兜底（仅用于开发） */
export const fallbackCurriculum: CurriculumSeed = {
  region: "广东",
  subjects: [
    {
      name: "数学",
      icon: "🔢",
      knowledgePoints: [
        {
          name: "20以内加减法",
          grade: 1,
          order: 1,
          children: [
            { name: "不进位加法", grade: 1, order: 1 },
            { name: "退位减法", grade: 1, order: 2 },
          ],
        },
        { name: "表内乘法", grade: 2, order: 2 },
        { name: "分数初步认识", grade: 3, order: 3 },
      ],
    },
    {
      name: "语文",
      icon: "📖",
      knowledgePoints: [
        {
          name: "拼音",
          grade: 1,
          order: 1,
          children: [
            { name: "声母韵母", grade: 1, order: 1 },
            { name: "整体认读音节", grade: 1, order: 2 },
          ],
        },
        { name: "识字与写字", grade: 1, order: 2 },
        { name: "阅读理解", grade: 3, order: 3 },
      ],
    },
    {
      name: "英语",
      icon: "🔤",
      knowledgePoints: [
        {
          name: "字母与发音",
          grade: 1,
          order: 1,
          children: [
            { name: "26个字母", grade: 1, order: 1 },
            { name: "自然拼读", grade: 2, order: 2 },
          ],
        },
        { name: "常用句型", grade: 3, order: 2 },
      ],
    },
  ],
};

export function loadCachedCurriculum(): CurriculumSeed | null {
  const path = getCurriculumCachePath();
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as CurriculumSeed;
    if (!data.subjects?.length) return null;
    return data;
  } catch {
    return null;
  }
}
