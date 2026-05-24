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
    if (u.hostname.replace(/^www\./, "").includes("search.bilibili")) {
      return false;
    }
    return /\/video\/(BV|bv|av)/i.test(u.pathname);
  } catch {
    return false;
  }
}

/** 统一为 bilibili.com/video/BV… 形式，便于各端直接打开播放页 */
export function normalizeBilibiliVideoUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (!isAllowedVideoUrl(u.href)) return url;

    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "b23.tv") return u.href;

    const bv = u.pathname.match(/\/video\/(BV[\w]+)/i)?.[1];
    if (bv) return `https://www.bilibili.com/video/${bv}`;

    const av = u.pathname.match(/\/video\/av(\d+)/i)?.[1];
    if (av) return `https://www.bilibili.com/video/av${av}`;

    return u.href;
  } catch {
    return url;
  }
}

type BilibiliSearchApiResult = {
  code?: number;
  data?: {
    result?: Array<{
      bvid?: string;
      title?: string;
      arcurl?: string;
    }>;
  };
};

/** 通过 B 站公开搜索接口获取具体视频页（无 Tavily 时的兜底） */
export async function searchBilibiliVideoByKeyword(
  keyword: string
): Promise<{ title: string; url: string } | null> {
  const q = keyword.replace(/\s+/g, " ").trim();
  if (!q) return null;

  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(q)}&page=1&page_size=8`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://www.bilibili.com",
        },
        signal: AbortSignal.timeout(12000),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as BilibiliSearchApiResult;
    if (data.code !== 0 || !data.data?.result?.length) return null;

    for (const item of data.data.result) {
      const raw =
        item.arcurl ||
        (item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : "");
      if (!raw || !isAllowedVideoUrl(raw)) continue;
      const url = normalizeBilibiliVideoUrl(raw);
      if (isDirectBilibiliVideoUrl(url)) {
        return { title: item.title || q, url };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function pickFirstVideoUrl(
  results: { title: string; url: string }[]
): { title: string; url: string } | null {
  for (const r of results) {
    if (!isAllowedVideoUrl(r.url)) continue;
    const url = normalizeBilibiliVideoUrl(r.url);
    if (isDirectBilibiliVideoUrl(url)) {
      return { title: r.title, url };
    }
  }
  return null;
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
