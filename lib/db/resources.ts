import { supabaseAdmin } from "@/lib/supabase/admin";
import { AiNews, GithubRepo } from "@/types/resources";

const supabase = supabaseAdmin;

export const NEWS_LIST_FIELDS = "id, source_id, title, slug, original_url, canonical_url, source_name, author, excerpt, image_url, company_tags, topic_tags, published_at, freshness_score, importance_score, quality_score, total_score, status, review_status";

export const REPO_LIST_FIELDS = "id, source_id, github_id, owner, repo_name, full_name, slug, description, html_url, clone_url, homepage_url, primary_language, license_name, topics, category_tags, stars_count, forks_count, watchers_count, open_issues_count, created_at_github, updated_at_github, pushed_at_github, trend_score, quality_score, total_score, is_archived, is_fork, status, review_status";

// ─── Homepage News (with diversity filtering) ───
export async function getHomepageNews(): Promise<AiNews[]> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data, error } = await supabase
    .from("ai_resource_news")
    .select(NEWS_LIST_FIELDS)
    .eq("status", "published")
    .gte("published_at", fourteenDaysAgo.toISOString())
    .order("published_at", { ascending: false })
    .order("total_score", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching homepage news:", error);
    return [];
  }

  const selected: AiNews[] = [];
  const sourceCount: Record<string, number> = {};
  const titles = new Set<string>();

  for (const item of (data as unknown as AiNews[]) || []) {
    if (selected.length >= 4) break;

    const source = item.source_name;
    const titleKey = `${item.title.toLowerCase().trim()}|${source.toLowerCase().trim()}`;

    // Skip duplicates
    if (titles.has(titleKey)) continue;
    // Diversity filter: max 2 articles from same source
    if ((sourceCount[source] || 0) >= 2) continue;

    selected.push(item);
    sourceCount[source] = (sourceCount[source] || 0) + 1;
    titles.add(titleKey);
  }

  // Fallback: if not enough items in last 14 days, grab overall highest-scoring published news
  if (selected.length < 4) {
    const { data: fallbackData } = await supabase
      .from("ai_resource_news")
      .select(NEWS_LIST_FIELDS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("total_score", { ascending: false })
      .limit(20);

    for (const item of (fallbackData as unknown as AiNews[]) || []) {
      if (selected.length >= 4) break;

      const source = item.source_name;
      const titleKey = `${item.title.toLowerCase().trim()}|${source.toLowerCase().trim()}`;

      if (selected.some((s) => s.id === item.id)) continue;
      if (titles.has(titleKey)) continue;
      if ((sourceCount[source] || 0) >= 2) continue;

      selected.push(item);
      sourceCount[source] = (sourceCount[source] || 0) + 1;
      titles.add(titleKey);
    }
  }

  return selected;
}

// ─── Homepage GitHub Repos (with diversity filtering) ───
export async function getHomepageRepos(): Promise<GithubRepo[]> {
  const { data, error } = await supabase
    .from("ai_resource_github_repos")
    .select(REPO_LIST_FIELDS)
    .eq("status", "published")
    .eq("is_archived", false)
    .eq("is_fork", false)
    .order("total_score", { ascending: false })
    .order("stars_count", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching homepage repos:", error);
    return [];
  }

  const selected: GithubRepo[] = [];
  const ownerCount: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};

  for (const repo of (data as unknown as GithubRepo[]) || []) {
    if (selected.length >= 4) break;

    const owner = repo.owner;
    const categories = repo.category_tags || [];

    // Diversity filter: max 1 repo from same owner
    if ((ownerCount[owner] || 0) >= 1) continue;

    // Diversity filter: max 4 repos from same category
    let categoryLimitExceeded = false;
    for (const cat of categories) {
      if ((categoryCount[cat] || 0) >= 4) {
        categoryLimitExceeded = true;
        break;
      }
    }
    if (categoryLimitExceeded) continue;

    selected.push(repo);
    ownerCount[owner] = (ownerCount[owner] || 0) + 1;
    for (const cat of categories) {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  }

  return selected;
}

// ─── Paginated News ───
export async function getNewsPaginated(options: {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
}): Promise<{ news: AiNews[]; total: number }> {
  const page = options.page || 1;
  const perPage = options.perPage || 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("ai_resource_news")
    .select(NEWS_LIST_FIELDS, { count: "exact" })
    .eq("status", "published");

  // Filtering
  const filter = options.filter || "all";
  if (filter === "official") {
    query = query.in("source_name", ["OpenAI", "Anthropic", "Google", "Microsoft", "NVIDIA", "Hugging Face"]);
  } else if (["openai", "google", "microsoft", "nvidia", "hugging-face"].includes(filter.toLowerCase())) {
    let sourceQuery = filter;
    if (filter === "hugging-face") sourceQuery = "Hugging Face";
    query = query.ilike("source_name", `%${sourceQuery}%`);
  } else if (["models", "agents", "rag", "developer"].includes(filter.toLowerCase())) {
    query = query.contains("topic_tags", [filter.toLowerCase()]);
  }

  // Sorting
  const sort = options.sort || "latest";
  if (sort === "latest") {
    query = query.order("published_at", { ascending: false });
  } else if (sort === "top_today") {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    query = query
      .gte("published_at", oneDayAgo.toISOString())
      .order("total_score", { ascending: false });
  } else if (sort === "official") {
    query = query
      .in("source_name", ["OpenAI", "Anthropic", "Google", "Microsoft", "NVIDIA", "Hugging Face"])
      .order("published_at", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("total_score", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("Error fetching paginated news:", error);
    return { news: [], total: 0 };
  }

  return { news: (data as unknown as AiNews[]) || [], total: count || 0 };
}

// ─── Paginated Repos ───
export async function getReposPaginated(options: {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
}): Promise<{ repos: GithubRepo[]; total: number }> {
  const page = options.page || 1;
  const perPage = options.perPage || 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("ai_resource_github_repos")
    .select(REPO_LIST_FIELDS, { count: "exact" })
    .eq("status", "published")
    .eq("is_archived", false)
    .eq("is_fork", false);

  // Filtering
  const filter = options.filter || "all";
  const categoryFilters = ["llm", "rag", "agents", "mcp", "vector-db", "voice-ai", "computer-vision"];
  if (categoryFilters.includes(filter.toLowerCase())) {
    query = query.contains("category_tags", [filter.toLowerCase()]);
  } else if (filter.toLowerCase() === "python") {
    query = query.ilike("primary_language", "Python");
  } else if (filter.toLowerCase() === "typescript") {
    query = query.ilike("primary_language", "TypeScript");
  }

  // Sorting
  const sort = options.sort || "trending";
  if (sort === "trending") {
    query = query
      .order("total_score", { ascending: false })
      .order("stars_count", { ascending: false });
  } else if (sort === "stars") {
    query = query.order("stars_count", { ascending: false });
  } else if (sort === "updated") {
    query = query.order("pushed_at_github", { ascending: false });
  } else if (sort === "new_this_week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    query = query
      .gte("created_at_github", oneWeekAgo.toISOString())
      .order("stars_count", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("Error fetching paginated repos:", error);
    return { repos: [], total: 0 };
  }

  return { repos: (data as unknown as GithubRepo[]) || [], total: count || 0 };
}

// ─── Single News by Slug ───
export async function getNewsBySlug(slug: string): Promise<AiNews | null> {
  const { data, error } = await supabase
    .from("ai_resource_news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Error fetching news by slug:", error);
    return null;
  }
  return data as AiNews | null;
}

// ─── Single Repo by Slug ───
export async function getRepoBySlug(slug: string): Promise<GithubRepo | null> {
  const { data, error } = await supabase
    .from("ai_resource_github_repos")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Error fetching repo by slug:", error);
    return null;
  }
  return data as GithubRepo | null;
}

// ─── All News Slugs for generateStaticParams ───
export async function getAllNewsSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("ai_resource_news")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching all news slugs:", error);
    return [];
  }
  return (data || []).map((row) => row.slug);
}

// ─── All Repo Slugs for generateStaticParams ───
export async function getAllRepoSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("ai_resource_github_repos")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching all repo slugs:", error);
    return [];
  }
  return (data || []).map((row) => row.slug);
}

// ─── Related News Articles ───
export async function getRelatedNews(excludeSlug: string, sourceName: string, limit = 3): Promise<AiNews[]> {
  const { data, error } = await supabase
    .from("ai_resource_news")
    .select(NEWS_LIST_FIELDS)
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .eq("source_name", sourceName)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from("ai_resource_news")
      .select(NEWS_LIST_FIELDS)
      .eq("status", "published")
      .neq("slug", excludeSlug)
      .order("total_score", { ascending: false })
      .limit(limit);
    return (fallbackData as unknown as AiNews[]) || [];
  }
  return data as unknown as AiNews[];
}

// ─── Related GitHub Repositories ───
export async function getRelatedRepos(excludeSlug: string, primaryLanguage: string | null, limit = 3): Promise<GithubRepo[]> {
  let query = supabase
    .from("ai_resource_github_repos")
    .select(REPO_LIST_FIELDS)
    .eq("status", "published")
    .neq("slug", excludeSlug);

  if (primaryLanguage) {
    query = query.eq("primary_language", primaryLanguage);
  }

  const { data, error } = await query
    .order("stars_count", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from("ai_resource_github_repos")
      .select(REPO_LIST_FIELDS)
      .eq("status", "published")
      .neq("slug", excludeSlug)
      .order("stars_count", { ascending: false })
      .limit(limit);
    return (fallbackData as unknown as GithubRepo[]) || [];
  }
  return data as unknown as GithubRepo[];
}
