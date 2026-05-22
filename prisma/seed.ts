import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  fallbackCurriculum,
  loadCachedCurriculum,
  type KnowledgePointSeed,
  type SubjectSeed,
} from "./seed-data";
import {
  generateAndSaveCurriculum,
  generateGuangdongCurriculum,
} from "./generate-curriculum";

const prisma = new PrismaClient();

async function createKnowledgePoints(
  subjectId: string,
  nodes: KnowledgePointSeed[],
  parentId?: string
) {
  for (const node of nodes) {
    const created = await prisma.knowledgePoint.create({
      data: {
        subjectId,
        name: node.name,
        grade: node.grade,
        order: node.order,
        parentId,
      },
    });

    if (node.children?.length) {
      await createKnowledgePoints(subjectId, node.children, created.id);
    }
  }
}

async function resolveCurriculum() {
  const region = process.env.SEED_REGION?.trim() || "广东";
  const forceRegenerate = process.env.SEED_FORCE_REGENERATE === "1";
  const useCache = process.env.SEED_USE_CACHE !== "0";

  if (!forceRegenerate && useCache) {
    const cached = loadCachedCurriculum();
    if (cached) {
      console.log(`  使用缓存课程标准（${cached.region}）`);
      return cached;
    }
  }

  console.log(`  正在调用大模型生成【${region}】小学 8 科知识点…`);
  console.log("  （依据义务教育课程标准及广东省教学安排，约需 30-60 秒）");

  try {
    if (process.env.SEED_SAVE_CACHE !== "0") {
      return await generateAndSaveCurriculum(region);
    }
    return await generateGuangdongCurriculum(region);
  } catch (e) {
    console.warn("  ⚠ 大模型生成失败，使用最小兜底数据:", e);
    return fallbackCurriculum;
  }
}

async function main() {
  console.log("🌱 开始播种科目与知识点（AI + 广东课程标准）…");

  const curriculum = await resolveCurriculum();
  const subjectSeeds = curriculum.subjects;

  const deleted = await prisma.knowledgePoint.deleteMany();
  console.log(`  已清除 ${deleted.count} 条旧知识点`);

  const seedNames = subjectSeeds.map((s) => s.name);
  const removed = await prisma.subject.deleteMany({
    where: { name: { notIn: seedNames } },
  });
  if (removed.count > 0) {
    console.log(`  已移除 ${removed.count} 个不在课程标准内的旧科目`);
  }

  for (const subjectSeed of subjectSeeds) {
    const subject = await prisma.subject.upsert({
      where: { name: subjectSeed.name },
      update: { icon: subjectSeed.icon },
      create: {
        name: subjectSeed.name,
        icon: subjectSeed.icon,
      },
    });

    await createKnowledgePoints(subject.id, subjectSeed.knowledgePoints);

    const count = await prisma.knowledgePoint.count({
      where: { subjectId: subject.id },
    });
    console.log(`  ✓ ${subject.icon} ${subject.name}：${count} 个知识点`);
  }

  const total = await prisma.knowledgePoint.count();
  console.log(
    `\n✅ 播种完成（${curriculum.region}），共 ${total} 个知识点，${subjectSeeds.length} 个科目`
  );
}

main()
  .catch((e) => {
    console.error("❌ 播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
