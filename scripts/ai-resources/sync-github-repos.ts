import { supabaseAdmin } from "./supabase-admin";
import { makeSlug } from "./slugify";
import { scoreGithubRepo } from "./scoring";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  html_url: string;
  clone_url: string;
  homepage: string | null;
  language: string | null;
  license: {
    name: string;
  } | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
};

function mapCategoryTags(repo: GitHubRepo, sourceCategory?: string) {
  const text = `${repo.full_name} ${repo.description ?? ""} ${(repo.topics ?? []).join(" ")}`.toLowerCase();
  const tags = new Set<string>();

  if (sourceCategory) tags.add(sourceCategory);

  if (text.includes("rag")) tags.add("rag");
  if (text.includes("llm")) tags.add("llm");
  if (text.includes("agent")) tags.add("agents");
  if (text.includes("mcp")) tags.add("mcp");
  if (text.includes("embedding") || text.includes("vector")) tags.add("vector-db");
  if (text.includes("speech") || text.includes("voice")) tags.add("voice-ai");
  if (text.includes("computer vision") || text.includes("vision")) tags.add("computer-vision");

  return Array.from(tags);
}

export async function syncGithubRepos() {
  const githubToken = process.env.GITHUB_TOKEN;

  const { data: sources, error: sourceError } = await supabaseAdmin
    .from("ai_resource_sources")
    .select("*")
    .eq("source_type", "github_search")
    .eq("source_group", "github_repos")
    .eq("is_active", true);

  if (sourceError) throw sourceError;

  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const source of sources ?? []) {
    try {
      if (!source.query_text) {
        totalSkipped++;
        continue;
      }

      const url = new URL("https://api.github.com/search/repositories");
      url.searchParams.set("q", source.query_text);
      url.searchParams.set("sort", "stars");
      url.searchParams.set("order", "desc");
      url.searchParams.set("per_page", "30");

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "mycaptionai-ai-resource-sync",
          ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API failed: ${response.status} ${await response.text()}`);
      }

      const json = await response.json();
      const repos = (json.items ?? []) as GitHubRepo[];

      totalFetched += repos.length;

      const sourceCategory = source.metadata?.category as string | undefined;

      for (const repo of repos) {
        if (repo.archived || repo.fork) {
          totalSkipped++;
          continue;
        }

        const topics = repo.topics ?? [];
        const categoryTags = mapCategoryTags(repo, sourceCategory);

        const scores = scoreGithubRepo({
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          pushedAt: repo.pushed_at,
          topics,
          isArchived: repo.archived,
          isFork: repo.fork,
        });

        const slug = makeSlug(repo.full_name.replace("/", "-"));

        const payload = {
          source_id: source.id,
          github_id: repo.id,
          owner: repo.owner.login,
          repo_name: repo.name,
          full_name: repo.full_name,
          slug,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          homepage_url: repo.homepage,
          primary_language: repo.language,
          license_name: repo.license?.name ?? null,
          topics,
          category_tags: categoryTags,
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          watchers_count: repo.watchers_count,
          open_issues_count: repo.open_issues_count,
          created_at_github: repo.created_at,
          updated_at_github: repo.updated_at,
          pushed_at_github: repo.pushed_at,
          last_seen_at: new Date().toISOString(),
          trend_score: scores.trendScore,
          quality_score: scores.qualityScore,
          total_score: scores.totalScore,
          is_archived: repo.archived,
          is_fork: repo.fork,
          status: "published",
          review_status: scores.totalScore >= 80 ? "auto_approved" : "needs_review",
          seo_title: `${repo.full_name}: Open-source AI Project | MyCaptionAI`.slice(0, 70),
          seo_description: `Explore ${repo.full_name}, an open-source AI project with stars, language, topics, and related AI use cases.`.slice(0, 160),
          fetched_at: new Date().toISOString(),
        };

        const { data: existing, error: existingError } = await supabaseAdmin
          .from("ai_resource_github_repos")
          .select("id")
          .eq("github_id", repo.id)
          .maybeSingle();

        if (existingError) {
          totalFailed++;
          console.error("GitHub repo lookup failed:", repo.full_name, existingError.message);
          continue;
        }

        const { error } = await supabaseAdmin
          .from("ai_resource_github_repos")
          .upsert(payload, {
            onConflict: "github_id",
          });

        if (error) {
          totalFailed++;
          console.error("GitHub repo upsert failed:", repo.full_name, error.message);
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
          last_error: error instanceof Error ? error.message : "Unknown GitHub sync error",
        })
        .eq("id", source.id);

      console.error(`GitHub source failed: ${source.name}`, error);
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
  syncGithubRepos()
    .then((result) => {
      console.log("GitHub repos sync complete:", result);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}