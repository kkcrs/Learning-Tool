import "dotenv/config";
import {
  isDirectBilibiliVideoUrl,
  searchLearningVideos,
} from "../src/lib/web-search";

async function main() {
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) {
    console.log("❌ TAVILY_API_KEY 未读取到（检查 .env）");
    process.exit(1);
  }
  console.log("✓ TAVILY_API_KEY 已加载");

  const results = await searchLearningVideos("小学三年级 语文 拼音 教学");
  console.log(`Tavily 返回 ${results.length} 条：\n`);

  for (const r of results.slice(0, 5)) {
    const tag = isDirectBilibiliVideoUrl(r.url) ? "视频页" : "非视频";
    console.log(`[${tag}] ${r.title}`);
    console.log(`  ${r.url}\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
