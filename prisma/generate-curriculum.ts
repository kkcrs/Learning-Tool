import "dotenv/config";
import { writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { generateStructuredResponse } from "../src/lib/ai";
import type { CurriculumSeed, SubjectSeed } from "./seed-types";

const childSchema = z.object({
  name: z.string().min(1),
  grade: z.number().int().min(1).max(6),
  order: z.number().int().min(0),
});

const knowledgePointSchema = z.object({
  name: z.string().min(1),
  grade: z.number().int().min(1).max(6),
  order: z.number().int().min(0),
  children: z.array(childSchema).optional(),
});

const subjectSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  knowledgePoints: z.array(knowledgePointSchema).min(3),
});

const curriculumSchema = z.object({
  region: z.string().min(1),
  subjects: z.array(subjectSchema).min(6).max(9),
});

/** 广东省小学常见开设科目（由 AI 填充知识点，非写死列表） */
export const GUANGDONG_PRIMARY_SUBJECTS = [
  "语文",
  "数学",
  "道德与法治",
  "科学",
  "音乐",
  "美术",
  "体育",
  "英语",
] as const;

const SUBJECT_ICONS: Record<string, string> = {
  语文: "📖",
  数学: "🔢",
  英语: "🔤",
  科学: "🔬",
  道德与法治: "⚖️",
  音乐: "🎵",
  美术: "🎨",
  体育: "⚽",
};

function normalizeIcon(name: string, icon: string): string {
  if (icon && icon.length <= 4) return icon;
  return SUBJECT_ICONS[name] ?? "📚";
}

function normalizeOrders<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i + 1 }));
}

function normalizeSubject(subject: z.infer<typeof subjectSchema>): SubjectSeed {
  const knowledgePoints = normalizeOrders(subject.knowledgePoints).map(
    (kp) => ({
      ...kp,
      children: kp.children?.length
        ? normalizeOrders(kp.children)
        : undefined,
    })
  );

  return {
    name: subject.name.trim(),
    icon: normalizeIcon(subject.name, subject.icon),
    knowledgePoints,
  };
}

export async function generateGuangdongCurriculum(
  region = process.env.SEED_REGION?.trim() || "广东"
): Promise<CurriculumSeed> {
  const systemPrompt = `你是熟悉中国义务教育课程体系的教研员，专门为小学（1-6年级）设计科目与知识点树形大纲。
输出必须是合法 JSON，结构为：
{
  "region": "省份名",
  "subjects": [
    {
      "name": "科目名",
      "icon": "一个emoji",
      "knowledgePoints": [
        {
          "name": "一级知识点/单元主题",
          "grade": 1-6,
          "order": 从1递增,
          "children": [
            { "name": "二级知识点", "grade": 同年级或该单元年级, "order": 从1递增 }
          ]
        }
      ]
    }
  ]
}
要求：
1. 严格依据《义务教育课程标准（2022年版）》及该省小学教学实际；
2. 科目必须完整包含：语文、数学、道德与法治、科学、音乐、美术、体育、英语（共 8 科，缺一不可）；
3. 英语：广东省多数小学从三年级系统开课（PEP/粤教版），一、二年级也需有 2-3 个启蒙一级知识点且 grade 标为 1 或 2；三至六年级按教材单元展开；
4. 每个科目 10-16 个一级知识点，覆盖 1-6 年级，grade 标明该单元主要适用年级；
5. 每个一级知识点下 2-4 个二级子知识点，子节点 grade 与所属单元一致；
6. 名称简洁，使用教材常见单元表述；
7. 不要输出 markdown 或解释文字。`;

  const userPrompt = `请生成【${region}省】小学 1-6 年级完整课程体系（8 科：${GUANGDONG_PRIMARY_SUBJECTS.join("、")}）。
侧重${region}省通用安排：部编版语文、人教版数学、粤教版/PEP 英语、统编道德与法治、教科版/粤教版科学等。`;

  const raw = await generateStructuredResponse(
    systemPrompt,
    userPrompt,
    curriculumSchema
  );

  return {
    region: raw.region || region,
    subjects: raw.subjects.map(normalizeSubject),
  };
}

export function getCurriculumCachePath() {
  return join(process.cwd(), "prisma", "data", "guangdong-curriculum.json");
}

export async function generateAndSaveCurriculum(
  region?: string
): Promise<CurriculumSeed> {
  const curriculum = await generateGuangdongCurriculum(region);
  const path = getCurriculumCachePath();
  writeFileSync(path, JSON.stringify(curriculum, null, 2), "utf-8");
  console.log(`  已写入缓存: ${path}`);
  return curriculum;
}

const isCli =
  typeof process.argv[1] === "string" &&
  process.argv[1].replace(/\\/g, "/").includes("generate-curriculum");

if (isCli) {
  const region = process.env.SEED_REGION?.trim() || "广东";
  generateAndSaveCurriculum(region)
    .then((c) => {
      console.log(
        `✅ 已生成 ${c.subjects.length} 个科目，区域：${c.region}`
      );
      for (const s of c.subjects) {
        console.log(
          `  ${s.icon} ${s.name}：${s.knowledgePoints.length} 个一级知识点`
        );
      }
    })
    .catch((e) => {
      console.error("❌ 生成失败:", e);
      process.exit(1);
    });
}
