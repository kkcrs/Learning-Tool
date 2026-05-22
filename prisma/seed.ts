import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  subjectSeeds,
  type KnowledgePointSeed,
} from "./seed-data";

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

async function main() {
  console.log("🌱 开始播种科目与知识点…");

  // 仅清空知识点，保留科目及用户学习记录
  const deleted = await prisma.knowledgePoint.deleteMany();
  console.log(`  已清除 ${deleted.count} 条旧知识点`);

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
  console.log(`\n✅ 播种完成，共 ${total} 个知识点`);
}

main()
  .catch((e) => {
    console.error("❌ 播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
