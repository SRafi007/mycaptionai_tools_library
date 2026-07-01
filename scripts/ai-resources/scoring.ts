const IMPORTANT_NEWS_KEYWORDS = [
  "launch",
  "release",
  "model",
  "api",
  "open source",
  "agent",
  "rag",
  "embedding",
  "multimodal",
  "benchmark",
  "developer",
  "pricing",
  "safety",
  "fine-tuning",
];

const IMPORTANT_COMPANIES = [
  "openai",
  "anthropic",
  "google",
  "deepmind",
  "microsoft",
  "nvidia",
  "hugging face",
  "meta",
  "mistral",
];

export function scoreNews(input: {
  title: string;
  excerpt?: string | null;
  sourceName: string;
  publishedAt?: string | null;
}) {
  const text = `${input.title} ${input.excerpt ?? ""}`.toLowerCase();

  let importanceScore = 0;
  let freshnessScore = 0;
  let qualityScore = 20;

  for (const keyword of IMPORTANT_NEWS_KEYWORDS) {
    if (text.includes(keyword)) importanceScore += 5;
  }

  for (const company of IMPORTANT_COMPANIES) {
    if (text.includes(company)) importanceScore += 8;
  }

  const source = input.sourceName.toLowerCase();

  if (
    ["openai", "anthropic", "google", "microsoft", "nvidia", "hugging face"].some((s) =>
      source.includes(s)
    )
  ) {
    qualityScore += 30;
  } else {
    qualityScore += 15;
  }

  if (input.publishedAt) {
    const time = new Date(input.publishedAt).getTime();

    if (!Number.isNaN(time)) {
      const ageMs = Date.now() - time;
      const ageHours = ageMs / 1000 / 60 / 60;

      if (ageHours <= 24) freshnessScore = 30;
      else if (ageHours <= 72) freshnessScore = 20;
      else if (ageHours <= 168) freshnessScore = 10;
    }
  }

  return {
    freshnessScore,
    importanceScore,
    qualityScore,
    totalScore: freshnessScore + importanceScore + qualityScore,
  };
}

export function scoreGithubRepo(input: {
  stars: number;
  forks: number;
  pushedAt?: string | null;
  topics: string[];
  isArchived: boolean;
  isFork: boolean;
}) {
  let trendScore = 0;
  let qualityScore = 0;

  trendScore += Math.min(input.stars * 0.4, 400);
  trendScore += Math.min(input.forks * 0.2, 100);

  const importantTopics = [
    "llm",
    "rag",
    "agents",
    "ai-agent",
    "mcp",
    "openai",
    "langchain",
    "llamaindex",
    "embeddings",
    "vector-database",
    "computer-vision",
    "speech",
  ];

  for (const topic of input.topics || []) {
    if (importantTopics.includes(topic.toLowerCase())) {
      qualityScore += 15;
    }
  }

  if (input.pushedAt) {
    const time = new Date(input.pushedAt).getTime();

    if (!Number.isNaN(time)) {
      const ageMs = Date.now() - time;
      const ageDays = ageMs / 1000 / 60 / 60 / 24;

      if (ageDays <= 7) trendScore += 80;
      else if (ageDays <= 30) trendScore += 50;
      else if (ageDays <= 90) trendScore += 20;
    }
  }

  if (input.isArchived) trendScore -= 200;
  if (input.isFork) trendScore -= 150;

  const totalScore = Math.max(0, Math.round(trendScore + qualityScore));

  return {
    trendScore: Math.max(0, Math.round(trendScore)),
    qualityScore: Math.max(0, Math.round(qualityScore)),
    totalScore,
  };
}
