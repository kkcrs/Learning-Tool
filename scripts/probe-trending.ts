import {
  fetchGithubTop30,
  fetchGithubTrendingGrowth,
} from "../src/lib/github-trends";

async function main() {
  const top = await fetchGithubTop30();
  console.log("top30", top.length, top[0]?.fullName, top[0]?.stars);
  const growth = await fetchGithubTrendingGrowth("weekly");
  console.log("growth", growth.length, growth[0]);
}

main().catch(console.error);
