import { generateStructuredResponse } from "@/lib/ai";
import type { GithubRepoAnalysisInput } from "@/lib/github-trends";
import { z } from "zod";

const projectSchema = z.object({
  rank: z.number(),
  fullName: z.string(),
  language: z.string(),
  purpose: z.string(),
  domains: z.array(z.string()).min(1).max(5),
});

const analysisSchema = z.object({
  overview: z.string(),
  topStars: z.object({
    intro: z.string(),
    projects: z.array(projectSchema).min(1).max(10),
  }),
  topGrowth: z.object({
    intro: z.string(),
    projects: z.array(projectSchema).min(1).max(10),
  }),
});

export type GithubTrendsAnalysis = z.infer<typeof analysisSchema>;

function formatProjectsForPrompt(
  label: string,
  items: GithubRepoAnalysisInput[]
) {
  return `${label}：\n${JSON.stringify(items, null, 2)}`;
}

export async function generateGithubTrendsAnalysis(params: {
  periodLabel: string;
  topStars: GithubRepoAnalysisInput[];
  topGrowth: GithubRepoAnalysisInput[];
}): Promise<GithubTrendsAnalysis> {
  const systemPrompt = `你是 AI 编程与开发者提效领域的开源分析师。榜单已限定为 Agent、LLM、MCP、代码助手、自动化工作流等方向（如 OpenClaw、Copilot 类工具）。根据 GitHub 仓库数据，用中文输出 JSON：
{
  "overview": "一段话总览当前 AI 编程 / Agent 提效生态特点（80字内）",
  "topStars": {
    "intro": "AI 编程领域 Star 总数 Top10 的整体特征（60字内）",
    "projects": [
      {
        "rank": 1,
        "fullName": "owner/repo",
        "language": "主要语言，未知则写「未标注」",
        "purpose": "项目用途（30字内）",
        "domains": ["适用领域1", "领域2"]
      }
    ]
  },
  "topGrowth": {
    "intro": "AI 编程领域增速 Top10 的整体特征（60字内）",
    "projects": [同上结构，数量与输入条数一致]
  }
}
要求：结合 description、语言、Star 数据推断用途与领域；表述通俗，适合开发者阅读。`;

  const userPrompt = `分析周期：${params.periodLabel}

${formatProjectsForPrompt("Star 总数 Top10", params.topStars)}

${formatProjectsForPrompt(`Star 增速 Top10（${params.periodLabel}）`, params.topGrowth)}`;

  const raw = await generateStructuredResponse(
    systemPrompt,
    userPrompt,
    analysisSchema
  );

  return raw;
}
