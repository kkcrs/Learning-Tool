import { cache } from "react";
import { assertDeepSeekConfigured, deepseek, DEEPSEEK_MODEL } from "@/lib/ai";
import {
  bilibiliSearchUrl,
  isAllowedVideoUrl,
  isDirectBilibiliVideoUrl,
  pickFirstVideoUrl,
  searchLearningVideos,
  type VideoSearchResult,
} from "@/lib/web-search";

function buildKeyword(params: {
  subjectName: string;
  knowledgePointName: string;
  parentName?: string;
  grade: number;
}) {
  const topic = params.parentName
    ? `${params.parentName} ${params.knowledgePointName}`
    : params.knowledgePointName;
  return `小学${params.grade}年级 ${params.subjectName} ${topic}`.trim();
}

async function refineSearchKeyword(params: {
  subjectName: string;
  knowledgePointName: string;
  parentName?: string;
  grade: number;
}): Promise<string> {
  assertDeepSeekConfigured();
  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "你是小学学习助手。根据知识点生成一个用于在哔哩哔哩搜索教学视频的简短中文关键词（12字以内），只输出关键词本身。",
      },
      {
        role: "user",
        content: `科目：${params.subjectName}，年级：${params.grade}，知识点：${params.parentName ? `${params.parentName} - ` : ""}${params.knowledgePointName}`,
      },
    ],
  });
  const text = completion.choices[0]?.message?.content?.trim();
  return text || buildKeyword(params);
}

async function pickBestBilibiliVideo(
  candidates: { title: string; url: string }[],
  context: string
): Promise<{ url: string; title: string } | null> {
  const allowed = candidates.filter((c) => isAllowedVideoUrl(c.url));
  if (allowed.length === 0) return null;
  if (allowed.length === 1) return allowed[0];

  assertDeepSeekConfigured();
  try {
    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            '从下列 B 站搜索结果中为小学生挑选最合适的一条教学视频。只输出 JSON：{ "url": "bilibili.com 完整链接", "title": "视频标题" }。',
        },
        {
          role: "user",
          content: `学习主题：${context}\n\n候选：\n${JSON.stringify(allowed.slice(0, 6))}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { url?: string; title?: string };
    if (parsed.url && isAllowedVideoUrl(parsed.url)) {
      return {
        url: parsed.url,
        title: parsed.title || "B站学习视频",
      };
    }
  } catch {
    /* 解析失败则用规则选取 */
  }
  return pickFirstVideoUrl(allowed);
}

export const findLearningVideo = cache(
  async (
    subjectName: string,
    knowledgePointName: string,
    parentName: string | undefined,
    grade: number
  ): Promise<VideoSearchResult> => {
    const params = { subjectName, knowledgePointName, parentName, grade };
    const keyword = await refineSearchKeyword(params);
    const context = `${buildKeyword(params)} 教学视频 讲解`;

    const webResults = await searchLearningVideos(context);

    if (webResults.length > 0) {
      const picked = await pickBestBilibiliVideo(webResults, context);
      if (picked) {
        return {
          url: picked.url,
          title: picked.title,
          source: isDirectBilibiliVideoUrl(picked.url)
            ? "bilibili-video"
            : "bilibili-search",
        };
      }
      const first = pickFirstVideoUrl(webResults);
      if (first) {
        return {
          url: first.url,
          title: first.title,
          source: isDirectBilibiliVideoUrl(first.url)
            ? "bilibili-video"
            : "bilibili-search",
        };
      }
    }

    return {
      url: bilibiliSearchUrl(keyword),
      title: `${keyword} · B站学习视频`,
      source: "bilibili-search",
    };
  }
);
