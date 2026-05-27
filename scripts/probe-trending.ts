import {
  fetchGithubTop15,
  fetchGithubTrendingGrowth,
} from "../src/lib/github-trends";

async function main() {
  const top = await fetchGithubTop15();
  console.log("top15", top.length, top[0]?.fullName, top[0]?.stars);
  const growth = await fetchGithubTrendingGrowth("weekly");
  console.log("growth", growth.length, growth[0]);
}

main().catch(console.error);
