/**
 * 联网搜索学习视频：仅 B 站
 */

export type VideoSearchResult = {
  url: string;
  title: string;
  source: "bilibili-search" | "bilibili-video";
};

type TavilyResult = {
  results?: { title?: string; url?: string }[];
};

const ALLOWED_HOST_SUFFIXES = ["bilibili.com", "b23.tv"] as const;

export function isAllowedVideoUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    );
  } catch {
    return false;
  }
}

export function isDirectBilibiliVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!isAllowedVideoUrl(url)) return false;
    return /\/video\/(BV|bv|av)/i.test(u.pathname);
  } catch {
    return false;
  }
}

export function pickFirstVideoUrl(
  results: { title: string; url: string }[]
): { title: string; url: string } | null {
  const video = results.find(
    (r) => isAllowedVideoUrl(r.url) && isDirectBilibiliVideoUrl(r.url)
  );
  if (video) return video;
  const any = results.find((r) => isAllowedVideoUrl(r.url));
  return any ?? null;
}

export async function searchLearningVideos(
  query: string
): Promise<{ title: string; url: string }[]> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} site:bilibili.com`,
        search_depth: "basic",
        max_results: 10,
        include_domains: ["bilibili.com", "b23.tv"],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as TavilyResult;
    return (data.results ?? [])
      .filter((r) => r.url && r.title && isAllowedVideoUrl(r.url))
      .map((r) => ({ title: r.title!, url: r.url! }));
  } catch {
    return [];
  }
}

export function bilibiliSearchUrl(keyword: string) {
  const q = keyword.replace(/\s+/g, " ").trim();
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`;
}
