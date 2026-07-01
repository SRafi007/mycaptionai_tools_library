import { supabaseAdmin } from "./supabase-admin";
import { syncAiNews } from "./sync-ai-news";
import { syncGithubRepos } from "./sync-github-repos";

async function main() {
  const startedAt = new Date().toISOString();

  const { data: run, error: runError } = await supabaseAdmin
    .from("ai_resource_sync_runs")
    .insert({
      sync_type: "all",
      status: "running",
      started_at: startedAt,
    })
    .select("id")
    .single();

  if (runError) throw runError;

  try {
    const newsResult = await syncAiNews();
    const githubResult = await syncGithubRepos();

    const totalFailed = newsResult.totalFailed + githubResult.totalFailed;

    await supabaseAdmin
      .from("ai_resource_sync_runs")
      .update({
        status: totalFailed > 0 ? "partial_success" : "success",
        finished_at: new Date().toISOString(),
        total_sources: newsResult.totalSources + githubResult.totalSources,
        total_fetched: newsResult.totalFetched + githubResult.totalFetched,
        total_inserted: newsResult.totalInserted + githubResult.totalInserted,
        total_updated: newsResult.totalUpdated + githubResult.totalUpdated,
        total_skipped: newsResult.totalSkipped + githubResult.totalSkipped,
        total_failed: totalFailed,
        metadata: {
          news: newsResult,
          github: githubResult,
        },
      })
      .eq("id", run.id);

    console.log("AI resource sync complete", {
      news: newsResult,
      github: githubResult,
    });
  } catch (error) {
    await supabaseAdmin
      .from("ai_resource_sync_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : "Unknown sync error",
      })
      .eq("id", run.id);

    throw error;
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });