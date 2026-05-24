import type { GithubTrendsAnalysis } from "@/server/ai/generate-github-trends-analysis";
import type { GithubRepoAnalysisInput } from "@/lib/github-trends";
import { formatStarCount } from "@/lib/github-trends";

function StarsProjectList({
  projects,
  statsByName,
}: {
  projects: GithubTrendsAnalysis["topStars"]["projects"];
  statsByName: Map<string, GithubRepoAnalysisInput>;
}) {
  return (
    <ul className="space-y-3">
      {projects.map((p) => {
        const stats = statsByName.get(p.fullName);
        return (
          <li
            key={p.fullName}
            className="rounded-xl border border-primary/10 bg-muted/30 px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-primary">#{p.rank}</span>
                <a
                  href={`https://github.com/${p.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {p.fullName}
                </a>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {p.language}
                </span>
              </div>
              {stats?.stars != null && (
                <span className="shrink-0 text-sm font-semibold text-primary">
                  ⭐ {formatStarCount(stats.stars)}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-foreground/90">{p.purpose}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              适用领域：{p.domains.join("、")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function GrowthProjectList({
  projects,
  statsByName,
  growthPeriodLabel,
}: {
  projects: GithubTrendsAnalysis["topGrowth"]["projects"];
  statsByName: Map<string, GithubRepoAnalysisInput>;
  growthPeriodLabel: string;
}) {
  return (
    <ul className="space-y-3">
      {projects.map((p) => {
        const stats = statsByName.get(p.fullName);
        return (
          <li
            key={p.fullName}
            className="rounded-xl border border-primary/10 bg-muted/30 px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-primary">#{p.rank}</span>
                <a
                  href={`https://github.com/${p.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {p.fullName}
                </a>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {p.language}
                </span>
              </div>
              {stats && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
                  {stats.stars != null && stats.stars > 0 && (
                    <span className="font-semibold text-foreground/80">
                      总 ⭐ {formatStarCount(stats.stars)}
                    </span>
                  )}
                  {stats.starsGained != null && stats.starsGained > 0 && (
                    <span className="font-semibold text-green-600">
                      {growthPeriodLabel} +{formatStarCount(stats.starsGained)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-sm text-foreground/90">{p.purpose}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              适用领域：{p.domains.join("、")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function GithubTrendsAnalysisView({
  data,
  topStarsStats,
  topGrowthStats,
  growthPeriodLabel,
}: {
  data: GithubTrendsAnalysis;
  topStarsStats: GithubRepoAnalysisInput[];
  topGrowthStats: GithubRepoAnalysisInput[];
  growthPeriodLabel: string;
}) {
  const topStarsByName = new Map(topStarsStats.map((s) => [s.fullName, s]));
  const topGrowthByName = new Map(topGrowthStats.map((s) => [s.fullName, s]));

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-foreground/90">{data.overview}</p>

      <section>
        <h3 className="mb-2 text-base font-semibold">Star 总数 Top 10 解读</h3>
        <p className="mb-3 text-sm text-muted-foreground">{data.topStars.intro}</p>
        <StarsProjectList
          projects={data.topStars.projects}
          statsByName={topStarsByName}
        />
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold">
          Star 增速 Top 10 解读（{growthPeriodLabel}）
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">{data.topGrowth.intro}</p>
        <GrowthProjectList
          projects={data.topGrowth.projects}
          statsByName={topGrowthByName}
          growthPeriodLabel={growthPeriodLabel}
        />
      </section>
    </div>
  );
}
