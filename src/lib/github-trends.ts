import { cache } from "react";

export type GithubTrendPeriod = "weekly" | "monthly";

export type GithubTopRepo = {
  fullName: string;
  stars: number;
  forks: number;
  language: string | null;
  description: string | null;
  url: string;
};

export type GithubGrowthRepo = {
  fullName: string;
  stars: number;
  starsGained: number;
  periodLabel: string;
  description: string | null;
  language: string | null;
  url: string;
};

/** 编程 / AI 提效 / Agent 领域（openclaw、MCP、Copilot 等）*/
const AI_DEV_KEYWORDS = [
  "ai",
  "llm",
  "agent",
  "mcp",
  "copilot",
  "openclaw",
  "open-claw",
  "claude",
  "openai",
  "coding",
  "codegen",
  "devtools",
  "developer",
  "programming",
  "assistant",
  "automation",
  "workflow",
  "cursor",
  "prompt",
  "rag",
  "chatbot",
  "transformer",
  "machine-learning",
  "ml",
  "gpt",
  "deepseek",
  "vibe-coding",
];

/** GitHub Search 最多 5 个 AND/OR/NOT，拆成多组并行查询后合并 */
const AI_DEV_SEARCH_GROUPS = [
  ["agent", "llm", "mcp"],
  ["openclaw", "copilot", "codegen"],
  ["claude", "openai", "cursor"],
  ["chatbot", "rag", "devtools"],
  ["automation", "assistant", "coding"],
];

function buildAiDevSearchQuery(
  keywords: string[],
  extra = ""
): string {
  const terms = keywords.join(" OR ");
  return `stars:>80 (${terms}) in:name,description${extra ? ` ${extra}` : ""}`;
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "learning-tool-github-trends",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseStarCount(text: string): number {
  return Number(text.replace(/,/g, "")) || 0;
}

function matchesAiDevDomain(
  fullName: string,
  description: string | null
): boolean {
  const text = `${fullName} ${description ?? ""}`.toLowerCase();
  return AI_DEV_KEYWORDS.some((kw) => text.includes(kw));
}

function mapSearchItem(item: {
  full_name: string;
  stargazers_count: number;
  forks_count?: number;
  language: string | null;
  description: string | null;
  html_url: string;
}): GithubTopRepo {
  return {
    fullName: item.full_name,
    stars: item.stargazers_count,
    forks: item.forks_count ?? 0,
    language: item.language,
    description: item.description,
    url: item.html_url,
  };
}

async function searchRepositoriesOnce(
  query: string,
  perPage = 30
): Promise<GithubTopRepo[]> {
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`,
    {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    console.warn(`GitHub Search 跳过无效查询 (${res.status}): ${query}`);
    return [];
  }

  const data = (await res.json()) as {
    items?: Array<{
      full_name: string;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      description: string | null;
      html_url: string;
    }>;
  };

  return (data.items ?? []).map(mapSearchItem);
}

async function searchRepositoriesMerged(
  extra = "",
  perPage = 30
): Promise<GithubTopRepo[]> {
  const queries = AI_DEV_SEARCH_GROUPS.map((group) =>
    buildAiDevSearchQuery(group, extra)
  );

  const batches = await Promise.all(
    queries.map((q) => searchRepositoriesOnce(q, perPage))
  );

  const merged = new Map<string, GithubTopRepo>();
  for (const batch of batches) {
    for (const repo of batch) {
      const existing = merged.get(repo.fullName);
      if (!existing || repo.stars > existing.stars) {
        merged.set(repo.fullName, repo);
      }
    }
  }

  return [...merged.values()]
    .filter((r) => matchesAiDevDomain(r.fullName, r.description))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 30);
}

/** AI 编程 / Agent 领域 Star 总数 Top 30 */
export async function fetchGithubTop30(): Promise<GithubTopRepo[]> {
  return searchRepositoriesMerged();
}

/** 同请求内去重，供多个 Suspense 区块并行复用 */
export const getGithubTop30 = cache(fetchGithubTop30);

function periodSinceDate(period: GithubTrendPeriod): string {
  const since = new Date();
  since.setDate(since.getDate() - (period === "weekly" ? 7 : 30));
  return since.toISOString().slice(0, 10);
}

/** 按周期内活跃度 + AI 领域筛选的增速榜（Search API） */
async function fetchGithubGrowthBySearch(
  period: GithubTrendPeriod
): Promise<GithubGrowthRepo[]> {
  const iso = periodSinceDate(period);
  const periodLabel =
    period === "weekly" ? "近一周（AI 编程活跃）" : "近一月（AI 编程活跃）";

  const repos = await searchRepositoriesMerged(`pushed:>${iso}`, 40);

  return repos.slice(0, 30).map((item) => ({
    fullName: item.fullName,
    stars: item.stars,
    starsGained: 0,
    periodLabel,
    description: item.description,
    language: item.language,
    url: item.url,
  }));
}

/** 抓取 Trending 并过滤为 AI 编程领域 */
async function scrapeGithubTrendingFiltered(
  period: GithubTrendPeriod
): Promise<GithubGrowthRepo[]> {
  const res = await fetch(`https://github.com/trending?since=${period}`, {
    headers: {
      Accept: "text/html",
      "User-Agent": "learning-tool-github-trends",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`GitHub Trending 抓取失败 (${res.status})`);

  const html = await res.text();
  const blocks = html.split('class="Box-row"').slice(1);
  const periodLabel = period === "weekly" ? "本周 Trending" : "本月 Trending";
  const results: GithubGrowthRepo[] = [];

  for (const block of blocks) {
    const repoMatch = block.match(
      /explore\.click[\s\S]*?href="\/([^"]+)"/
    );
    const starsMatch = block.match(
      /([\d,]+)\s+stars\s+(today|this week|this month)/i
    );
    const descMatch = block.match(
      /<p[^>]*class="[^"]*col-9[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/p>/
    );

    if (!repoMatch?.[1] || !starsMatch?.[1]) continue;

    const fullName = repoMatch[1].trim();
    if (!fullName.includes("/") || fullName.includes("login")) continue;

    const description = descMatch?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 120);

    if (!matchesAiDevDomain(fullName, description ?? null)) continue;

    results.push({
      fullName,
      stars: 0,
      starsGained: parseStarCount(starsMatch[1]),
      periodLabel,
      description: description || null,
      language: null,
      url: `https://github.com/${fullName}`,
    });
  }

  return results.sort((a, b) => b.starsGained - a.starsGained).slice(0, 30);
}

async function enrichGrowthWithTotalStars(
  repos: GithubGrowthRepo[]
): Promise<GithubGrowthRepo[]> {
  return Promise.all(
    repos.map(async (repo) => {
      if (repo.stars > 0) return repo;
      try {
        const res = await fetch(`https://api.github.com/repos/${repo.fullName}`, {
          headers: githubHeaders(),
          next: { revalidate: 3600 },
        });
        if (!res.ok) return repo;
        const data = (await res.json()) as {
          stargazers_count: number;
          language: string | null;
          description: string | null;
        };
        return {
          ...repo,
          stars: data.stargazers_count ?? 0,
          language: repo.language ?? data.language ?? null,
          description: repo.description ?? data.description ?? null,
        };
      } catch {
        return repo;
      }
    })
  );
}

export async function fetchGithubTrendingGrowth(
  period: GithubTrendPeriod
): Promise<GithubGrowthRepo[]> {
  let trending: GithubGrowthRepo[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      trending = await scrapeGithubTrendingFiltered(period);
      if (trending.length >= 5) break;
    } catch {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  const fromSearch = await fetchGithubGrowthBySearch(period);
  const merged = new Map<string, GithubGrowthRepo>();

  for (const repo of [...trending, ...fromSearch]) {
    const existing = merged.get(repo.fullName);
    if (
      !existing ||
      repo.starsGained > existing.starsGained ||
      (repo.starsGained === existing.starsGained && repo.stars > existing.stars)
    ) {
      merged.set(repo.fullName, repo);
    }
  }

  const sorted = [...merged.values()].sort((a, b) => {
    if (b.starsGained !== a.starsGained) return b.starsGained - a.starsGained;
    return b.stars - a.stars;
  });

  return enrichGrowthWithTotalStars(sorted.slice(0, 30));
}

export const getGithubTrendingGrowth = cache(fetchGithubTrendingGrowth);

export async function enrichRepoDetails(
  fullName: string
): Promise<{ language: string | null; description: string | null }> {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { language: null, description: null };
    const data = (await res.json()) as {
      language: string | null;
      description: string | null;
    };
    return {
      language: data.language ?? null,
      description: data.description ?? null,
    };
  } catch {
    return { language: null, description: null };
  }
}

export type GithubRepoAnalysisInput = {
  rank: number;
  fullName: string;
  language: string | null;
  description: string | null;
  stars?: number;
  starsGained?: number;
  periodLabel?: string;
  url: string;
};

export async function buildTop10ForAnalysis(
  topRepos: GithubTopRepo[],
  growthRepos: GithubGrowthRepo[]
): Promise<{
  topStars: GithubRepoAnalysisInput[];
  topGrowth: GithubRepoAnalysisInput[];
}> {
  const topStars = topRepos.slice(0, 10).map((r, i) => ({
    rank: i + 1,
    fullName: r.fullName,
    language: r.language,
    description: r.description,
    stars: r.stars,
    url: r.url,
  }));

  const growthTop = growthRepos.slice(0, 10);
  const enriched = await Promise.all(
    growthTop.map(async (r, i) => {
      const needsEnrich = !r.language && !r.description;
      const meta = needsEnrich ? await enrichRepoDetails(r.fullName) : null;
      return {
        rank: i + 1,
        fullName: r.fullName,
        language: r.language ?? meta?.language ?? null,
        description: r.description ?? meta?.description ?? null,
        stars: r.stars,
        starsGained: r.starsGained,
        periodLabel: r.periodLabel,
        url: r.url,
      };
    })
  );

  return { topStars, topGrowth: enriched };
}

export function formatStarCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function shortRepoName(fullName: string, max = 22): string {
  if (fullName.length <= max) return fullName;
  const [owner, repo] = fullName.split("/");
  if (repo.length + 2 <= max) return `${owner.slice(0, 3)}…/${repo}`;
  return `${fullName.slice(0, max - 1)}…`;
}
