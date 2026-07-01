import Parser from "rss-parser";
import crypto from "node:crypto";
import { supabaseAdmin } from "./supabase-admin";
import { makeSlug } from "./slugify";
import { scoreNews } from "./scoring";

const parser = new Parser();

function hashContent(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTags(title: string, excerpt?: string | null) {
  const text = `${title} ${excerpt ?? ""}`.toLowerCase();

  const topicTags = new Set<string>();
  const companyTags = new Set<string>();

  const topics = [
    "llm",
    "rag",
    "agents",
    "multimodal",
    "api",
    "open source",
    "embedding",
    "developer",
    "model",
    "fine-tuning",
    "benchmark",
  ];

  const companies = [
    "openai",
    "anthropic",
    "google",
    "microsoft",
    "nvidia",
    "hugging face",
    "meta",
    "mistral",
  ];

  for (const topic of topics) {
    if (text.includes(topic)) topicTags.add(topic);
  }

  for (const company of companies) {
    if (text.includes(company)) companyTags.add(company);
  }

  return {
    topicTags: Array.from(topicTags),
    companyTags: Array.from(companyTags),
  };
}

export async function syncAiNews() {
  const { data: sources, error: sourceError } = await supabaseAdmin
    .from("ai_resource_sources")
    .select("*")
    .eq("source_type", "rss")
    .eq("source_group", "ai_news")
    .eq("is_active", true);

  if (sourceError) throw sourceError;

  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const source of sources ?? []) {
    try {
      if (!source.url) {
        totalSkipped++;
        continue;
      }

      const feed = await parser.parseURL(source.url);
      const items = feed.items ?? [];

      totalFetched += items.length;

      for (const item of items.slice(0, 20)) {
        const title = item.title?.trim();
        const originalUrl = item.link?.trim();

        if (!title || !originalUrl) {
          totalSkipped++;
          continue;
        }

        const rawExcerpt =
          item.contentSnippet?.trim() ||
          item.summary?.trim() ||
          item.content?.trim() ||
          "";

        const excerpt = rawExcerpt ? stripHtml(rawExcerpt).slice(0, 500) : null;

        const publishedAt = item.isoDate || item.pubDate || null;

        const { topicTags, companyTags } = extractTags(title, excerpt);

        const scores = scoreNews({
          title,
          excerpt,
          sourceName: source.name,
          publishedAt,
        });

        const slug = makeSlug(`${title}-${source.slug}`);
        const contentHash = hashContent(`${title}|${originalUrl}|${excerpt ?? ""}`);

        const payload = {
          source_id: source.id,
          title,
          slug,
          original_url: originalUrl,
          canonical_url: `https://www.mycaptionai.com/resources/ai-news/${slug}`,
          source_name: source.name,
          author: item.creator || item.author || null,
          excerpt,
          summary: excerpt,
          why_it_matters: null,
          image_url: null,
          content_hash: contentHash,
          company_tags: companyTags,
          topic_tags: topicTags,
          published_at: publishedAt,
          fetched_at: new Date().toISOString(),
          freshness_score: scores.freshnessScore,
          importance_score: scores.importanceScore,
          quality_score: scores.qualityScore,
          total_score: scores.totalScore,
          status: "published",
          review_status: scores.totalScore >= 45 ? "auto_approved" : "needs_review",
          seo_title: `${title} | AI News | MyCaptionAI`.slice(0, 70),
          seo_description: `Read a short AI news summary from ${source.name}, including key topics and why it matters.`.slice(0, 160),
        };

        const { data: existing, error: existingError } = await supabaseAdmin
          .from("ai_resource_news")
          .select("id")
          .eq("original_url", originalUrl)
          .maybeSingle();

        if (existingError) {
          totalFailed++;
          console.error("News lookup failed:", title, existingError.message);
          continue;
        }

        const { error } = await supabaseAdmin
          .from("ai_resource_news")
          .upsert(payload, {
            onConflict: "original_url",
          });

        if (error) {
          totalFailed++;
          console.error("News upsert failed:", title, error.message);
          continue;
        }

        if (existing) totalUpdated++;
        else totalInserted++;
      }

      await supabaseAdmin
        .from("ai_resource_sources")
        .update({
          last_checked_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", source.id);
    } catch (error) {
      totalFailed++;

      await supabaseAdmin
        .from("ai_resource_sources")
        .update({
          last_checked_at: new Date().toISOString(),
          last_error: error instanceof Error ? error.message : "Unknown RSS sync error",
        })
        .eq("id", source.id);

      console.error(`RSS source failed: ${source.name}`, error);
    }
  }

  return {
    totalSources: sources?.length ?? 0,
    totalFetched,
    totalInserted,
    totalUpdated,
    totalSkipped,
    totalFailed,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncAiNews()
    .then((result) => {
      console.log("AI news sync complete:", result);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}