import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const SEED_SOURCE = "ecosystem_research_2026_04";
const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const ecosystems = [
  {
    name: "OpenAI",
    slug: "openai",
    description:
      "The OpenAI ecosystem spans ChatGPT, Codex, the OpenAI API Platform, agent frameworks, image tools, and open-weight models such as gpt-oss.",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  },
  {
    name: "Anthropic (Claude)",
    slug: "anthropic",
    description:
      "The Claude ecosystem includes Claude, Claude Desktop, Claude Code, Claude Design, the Anthropic API, Claude Code SDK, and MCP-powered integrations.",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Anthropic_logo.svg",
  },
  {
    name: "Google Gemini",
    slug: "google-gemini",
    description:
      "The Gemini ecosystem connects the Gemini app, Google AI Studio, Gemini API, Vertex AI, Gemini Code Assist, Gemini CLI, NotebookLM, and Google Gen AI SDKs.",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
  },
  {
    name: "Open Source (Llama / Mistral)",
    slug: "open-source",
    description:
      "The open and open-weight AI ecosystem covers model families, local runtimes, self-hosted interfaces, and inference servers such as Llama, Mistral, Ollama, LM Studio, Hugging Face, vLLM, llama.cpp, Open WebUI, Jan, and LocalAI.",
    icon_url:
      "https://cdn.iconscout.com/icon/free/png-256/free-open-source-icon-download-in-svg-png-gif-file-formats--coding-programming-web-development-pack-logos-icons-2260786.png?f=webp&w=256",
  },
];

const toolSpecs = [
  ["ChatGPT", "chatgpt", "OpenAI", "https://chatgpt.com/", "Freemium", "OpenAI's flagship AI assistant for chat, research, writing, images, voice, files, and agent workflows.", "chatgpt.com"],
  ["ChatGPT Atlas", "chatgpt-atlas", "OpenAI", "https://chatgpt.com/atlas", "Free", "OpenAI's browser with ChatGPT built in for web assistance, memory, search, and agent mode.", "chatgpt.com"],
  ["Codex", "codex", "OpenAI", "https://openai.com/codex", "Freemium", "OpenAI's coding agent for editing, reviewing, debugging, and shipping software.", "openai.com"],
  ["OpenAI API Platform", "openai-api-platform", "OpenAI", "https://platform.openai.com/docs", "Paid", "Developer platform for building applications with OpenAI models, tools, multimodal APIs, and SDKs.", "platform.openai.com"],
  ["OpenAI Agents SDK", "openai-agents-sdk", "OpenAI", "https://openai.github.io/openai-agents-python/", "Free", "OpenAI's lightweight SDK for building agentic apps with tools, handoffs, guardrails, and tracing.", "openai.github.io"],
  ["OpenAI Responses API", "openai-responses-api", "OpenAI", "https://platform.openai.com/docs/guides/responses-vs-chat-completions", "Paid", "OpenAI's recommended API primitive for stateful, multimodal, tool-using, agentic model interactions.", "platform.openai.com"],
  ["gpt-oss", "gpt-oss", "OpenAI", "https://openai.com/open-models", "Free", "OpenAI's Apache 2.0 open-weight reasoning models for self-hosted and private infrastructure.", "openai.com"],
  ["DALL-E", "dalle", "OpenAI", "https://openai.com/dall-e", "Freemium", "OpenAI's image-generation model line for creating and editing images from natural language prompts.", "openai.com"],
  ["Claude", "claude", "Anthropic", "https://claude.ai/", "Freemium", "Anthropic's AI assistant for writing, analysis, coding, research, artifacts, files, and connected work.", "claude.ai"],
  ["Claude Desktop", "claude-desktop", "Anthropic", "https://claude.com/download", "Free", "Anthropic's desktop and mobile app experience for Claude, with local tool connections and desktop extensions.", "claude.com"],
  ["Claude Code", "claude-code", "Anthropic", "https://www.anthropic.com/product/claude-code", "Freemium", "Anthropic's agentic coding tool for terminal-first code changes, testing, commits, and automation.", "anthropic.com"],
  ["Claude Design", "claude-design", "Anthropic", "https://claude.ai/design", "Freemium", "Anthropic Labs research preview for creating designs, prototypes, slides, and visual work with Claude.", "claude.ai"],
  ["Anthropic Console", "anthropic-console", "Anthropic", "https://platform.claude.com/", "Paid", "Anthropic's developer console for Claude API keys, billing, model testing, and platform access.", "platform.claude.com"],
  ["Claude Code SDK", "claude-code-sdk", "Anthropic", "https://docs.anthropic.com/en/docs/claude-code/sdk", "Free", "SDK built on the Claude Code agent harness for creating custom coding and business agents.", "docs.anthropic.com"],
  ["Model Context Protocol", "model-context-protocol", "Anthropic", "https://docs.anthropic.com/en/docs/mcp", "Free", "Open protocol for connecting AI applications to external tools, data sources, and MCP servers.", "anthropic.com"],
  ["Claude for Enterprise", "claude-enterprise", "Anthropic", "https://www.anthropic.com/claude/enterprise", "Contact", "Anthropic's enterprise Claude offering for secure organization-wide AI workflows.", "anthropic.com"],
  ["Gemini", "gemini", "Google", "https://gemini.google.com/", "Freemium", "Google's AI assistant for writing, planning, learning, multimodal prompts, live help, and connected workflows.", "gemini.google.com"],
  ["Google AI Studio", "google-ai-studio", "Google", "https://aistudio.google.com/", "Free", "Google's fastest path to prototype with Gemini models, prompt galleries, API keys, and model experiments.", "aistudio.google.com"],
  ["Gemini API", "gemini-api", "Google", "https://ai.google.dev/gemini-api/docs", "Freemium", "Google's developer API for building with Gemini models across text, multimodal, streaming, and realtime workloads.", "ai.google.dev"],
  ["Vertex AI", "vertex-ai", "Google Cloud", "https://cloud.google.com/vertex-ai/generative-ai/docs/overview", "Paid", "Google Cloud's enterprise platform for building, deploying, grounding, tuning, and monitoring generative AI apps.", "cloud.google.com"],
  ["Gemini Code Assist", "gemini-code-assist", "Google", "https://cloud.google.com/gemini/docs/codeassist/overview", "Freemium", "Google's AI coding assistant for IDEs, GitHub code review, and enterprise coding workflows.", "cloud.google.com"],
  ["Gemini CLI", "gemini-cli", "Google", "https://github.com/google-gemini/gemini-cli", "Free", "Google's open-source terminal AI agent with Gemini access, built-in tools, shell commands, web search, and MCP.", "github.com"],
  ["NotebookLM", "notebooklm", "Google", "https://notebooklm.google.com/", "Freemium", "Google's AI-powered notebook and research partner for grounded source work, summaries, audio, and video overviews.", "notebooklm.google.com"],
  ["Google Gen AI SDK", "google-gen-ai-sdk", "Google", "https://ai.google.dev/gemini-api/docs/downloads", "Free", "Official Google SDKs for building Gemini API applications in Python, JavaScript, Go, Java, and C#.", "ai.google.dev"],
  ["Llama", "llama", "Meta", "https://github.com/meta-llama/llama-models", "Free", "Meta's open large language model family for developers, researchers, and businesses building generative AI.", "llama.com"],
  ["Mistral", "mistral", "Mistral AI", "https://mistral.ai/", "Freemium", "Mistral AI's model and platform ecosystem for open-weight and commercial AI models.", "mistral.ai"],
  ["Le Chat", "le-chat", "Mistral AI", "https://chat.mistral.ai/", "Freemium", "Mistral's conversational AI workspace for chat, search, documents, Canvas, code interpreter, and custom agents.", "chat.mistral.ai"],
  ["Mistral AI Studio", "mistral-ai-studio", "Mistral AI", "https://docs.mistral.ai/getting-started/le-chat-studio-admin", "Paid", "Mistral's developer console for API keys, playground testing, agents, fine-tuning, evaluation, and usage monitoring.", "mistral.ai"],
  ["Mistral Vibe", "mistral-vibe", "Mistral AI", "https://docs.mistral.ai/", "Free", "Mistral's open-source terminal-native coding agent powered by Devstral.", "mistral.ai"],
  ["Ollama", "ollama", "Ollama", "https://ollama.com/", "Free", "Local and cloud model runner for open models such as Llama, Gemma, DeepSeek, Qwen, Mistral, and gpt-oss.", "ollama.com"],
  ["LM Studio", "lm-studio", "LM Studio", "https://lmstudio.ai/", "Free", "Local AI app and developer runtime for running, chatting with, and serving open models privately.", "lmstudio.ai"],
  ["Hugging Face Hub", "hugging-face-hub", "Hugging Face", "https://huggingface.co/", "Freemium", "Model hub and inference ecosystem for discovering, testing, hosting, and deploying open AI models.", "huggingface.co"],
  ["Replicate", "replicate", "Replicate", "https://replicate.com/", "Paid", "Cloud platform for running, fine-tuning, and deploying open models through APIs.", "replicate.com"],
  ["vLLM", "vllm", "vLLM Project", "https://github.com/vllm-project/vllm", "Free", "High-throughput, memory-efficient open-source inference and serving engine for LLMs.", "vllm.ai"],
  ["llama.cpp", "llama-cpp", "ggml.org", "https://github.com/ggml-org/llama.cpp", "Free", "C/C++ inference engine for running LLMs locally and in the cloud with broad CPU, GPU, and GGUF support.", "github.com"],
  ["Open WebUI", "open-webui", "Open WebUI", "https://openwebui.com/", "Free", "Self-hosted AI interface for local and cloud models with RAG, tools, voice, vision, and OpenAI-compatible backends.", "openwebui.com"],
  ["Jan", "jan", "Jan", "https://www.jan.ai/", "Free", "Open-source ChatGPT alternative for local and cloud models, desktop apps, Jan Hub, MCP, and local API serving.", "jan.ai"],
  ["LocalAI", "localai", "LocalAI", "https://localai.io/", "Free", "Open-source local AI stack and OpenAI-compatible API for running language, image, audio, and agent workloads.", "localai.io"],
  ["DeepSeek", "deepseek", "DeepSeek", "https://www.deepseek.com/", "Freemium", "DeepSeek's model and assistant ecosystem for efficient reasoning, coding, and open model workflows.", "deepseek.com"],
  ["Qwen", "qwen", "Alibaba", "https://qwen.ai/", "Freemium", "Alibaba's foundation model family and assistant ecosystem for reasoning, generation, coding, and multimodal tasks.", "qwen.ai"],
  ["Gemma", "gemma", "Google", "https://ai.google.dev/gemma", "Free", "Google's family of lightweight, open models for developers building local and deployable AI applications.", "ai.google.dev"],
  ["Groq Cloud", "groq-cloud", "Groq", "https://console.groq.com/", "Freemium", "High-speed hosted inference platform commonly used to serve open models with low latency.", "groq.com"],
];

const tools = toolSpecs.map(([name, slug, publisher, url, pricing_type, short_description, iconDomain]) => ({
  name,
  slug,
  publisher,
  url,
  pricing_type,
  short_description,
  icon_url: favicon(iconDomain),
  is_verified: true,
  status: "active",
  source: SEED_SOURCE,
  updated_at: new Date().toISOString(),
}));

const relations = {
  openai: [
    ["chatgpt", "Official Assistant", "official_product", "Primary OpenAI user interface for chat, files, research, images, voice, and agent workflows.", "https://chatgpt.com/"],
    ["chatgpt-atlas", "Official App", "official_product", "Browser layer for using ChatGPT directly across the web, with optional memory and agent mode.", "https://openai.com/index/introducing-chatgpt-atlas/"],
    ["codex", "Coding Agent", "official_product", "OpenAI's software engineering agent for terminal, IDE, cloud delegation, and code review workflows.", "https://openai.com/codex"],
    ["openai-api-platform", "Developer Platform", "api_platform", "Core platform for building apps with OpenAI hosted models, multimodal APIs, SDKs, and tools.", "https://platform.openai.com/docs/quickstart/using-the-api"],
    ["openai-responses-api", "Developer API", "api", "Recommended API primitive for stateful, multimodal, tool-using agentic applications.", "https://platform.openai.com/docs/guides/responses-vs-chat-completions"],
    ["openai-agents-sdk", "Agent Framework", "sdk", "Lightweight framework for building OpenAI-powered agents with handoffs, guardrails, tracing, and evaluations.", "https://openai.github.io/openai-agents-python/"],
    ["gpt-oss", "Open-Weight Models", "model", "OpenAI's Apache 2.0 open-weight model family for self-hosted and private infrastructure.", "https://openai.com/open-models"],
    ["dalle", "Image Generation", "model_product", "OpenAI image generation model line for visual creation and editing workflows.", "https://openai.com/dall-e"],
  ],
  anthropic: [
    ["claude", "Official Assistant", "official_product", "Primary Claude assistant experience for writing, analysis, coding, research, artifacts, and connected work.", "https://www.anthropic.com/claude"],
    ["claude-desktop", "Official App", "official_product", "Desktop and mobile app surface for Claude, local files, desktop extensions, and tool connections.", "https://claude.com/download"],
    ["claude-code", "Coding Agent", "official_product", "Agentic coding system that edits code, runs commands and tests, commits changes, and uses MCP integrations.", "https://www.anthropic.com/product/claude-code"],
    ["claude-design", "Design Product", "official_product", "Anthropic Labs research preview for Claude-assisted visual design, prototypes, slides, and one-pagers.", "https://www.anthropic.com/news/claude-design-anthropic-labs", "preview"],
    ["anthropic-console", "Developer Platform", "api_platform", "Developer console and platform entry point for Claude API keys, model testing, organization setup, and billing.", "https://platform.claude.com/"],
    ["claude-code-sdk", "Agent Framework", "sdk", "SDK for building custom agents on top of the Claude Code agent harness.", "https://docs.anthropic.com/en/docs/claude-code/sdk"],
    ["model-context-protocol", "Integration Protocol", "protocol", "Open protocol behind Claude and Claude Code integrations with external tools, data sources, and MCP servers.", "https://docs.anthropic.com/en/docs/mcp"],
    ["claude-enterprise", "Enterprise", "enterprise", "Enterprise Claude offering for secure team and organization-wide deployments.", "https://www.anthropic.com/claude/enterprise"],
  ],
  "google-gemini": [
    ["gemini", "Official Assistant", "official_product", "Primary Google Gemini assistant across chat, multimodal, live, research, and Google-connected workflows.", "https://gemini.google.com/"],
    ["google-ai-studio", "Developer Platform", "api_platform", "Fastest Google surface for prototyping with Gemini prompts, API keys, and model experiments.", "https://ai.google.dev/aistudio/"],
    ["gemini-api", "Developer API", "api", "API for building Gemini-powered applications across text, multimodal, streaming, and realtime workloads.", "https://ai.google.dev/gemini-api/docs"],
    ["vertex-ai", "Enterprise Platform", "api_platform", "Google Cloud production platform for Gemini agents, grounding, tuning, deployment, and governance.", "https://cloud.google.com/vertex-ai/generative-ai/docs/overview"],
    ["gemini-code-assist", "Coding Assistant", "official_product", "Gemini-powered coding help in IDEs, GitHub review, and enterprise software workflows.", "https://cloud.google.com/gemini/docs/codeassist/overview"],
    ["gemini-cli", "Coding Agent", "agent_tool", "Open-source terminal AI agent with Gemini access, built-in tools, shell execution, web search, and MCP.", "https://github.com/google-gemini/gemini-cli"],
    ["notebooklm", "Research Notebook", "official_product", "Source-grounded AI notebook for research, study, audio/video overviews, and project knowledge bases.", "https://notebooklm.google.com/"],
    ["google-gen-ai-sdk", "Developer SDK", "sdk", "Official Google SDK family for production Gemini API development.", "https://ai.google.dev/gemini-api/docs/downloads"],
  ],
  "open-source": [
    ["llama", "Model Family", "model", "Meta's open model family and tooling foundation for a large share of the open-weight ecosystem.", "https://github.com/meta-llama/llama-models"],
    ["mistral", "Model Family", "model", "Mistral AI's open-weight and commercial model family used across local, hosted, and enterprise deployments.", "https://mistral.ai/"],
    ["le-chat", "Assistant", "official_product", "Mistral's assistant workspace for chat, search, document analysis, Canvas, code interpreter, and custom agents.", "https://docs.mistral.ai/le-chat"],
    ["mistral-ai-studio", "Developer Platform", "api_platform", "Mistral's developer console for API keys, playground testing, agents, fine-tuning, evaluation, and usage monitoring.", "https://docs.mistral.ai/getting-started/le-chat-studio-admin"],
    ["mistral-vibe", "Coding Agent", "agent_tool", "Mistral's terminal-native coding agent product in the open model coding stack.", "https://docs.mistral.ai/"],
    ["ollama", "Local Runtime", "runtime", "Popular local and cloud model runner for pulling, running, serving, and integrating open models.", "https://docs.ollama.com/"],
    ["lm-studio", "Local Runtime", "runtime", "Desktop and developer runtime for chatting with, loading, serving, and connecting local models privately.", "https://lmstudio.ai/"],
    ["hugging-face-hub", "Model Hub", "model_hub", "Central hub for discovering, testing, hosting, and deploying open models and datasets.", "https://huggingface.co/docs/hub/en/models-inference"],
    ["replicate", "Model Hosting", "model_hosting", "Cloud platform for running, fine-tuning, and deploying open models via APIs.", "https://replicate.com/"],
    ["vllm", "Inference Server", "runtime", "High-throughput open-source serving engine for production open model inference.", "https://github.com/vllm-project/vllm"],
    ["llama-cpp", "Local Runtime", "runtime", "Core C/C++ runtime for quantized local inference, GGUF models, and OpenAI-compatible local serving.", "https://github.com/ggml-org/llama.cpp"],
    ["open-webui", "Self-Hosted UI", "interface", "Self-hosted AI interface for local and cloud models, commonly paired with Ollama and OpenAI-compatible APIs.", "https://docs.openwebui.com/"],
    ["jan", "Local Assistant", "interface", "Open-source local-first assistant and model platform with desktop apps, MCP, Jan Hub, and a local API server.", "https://www.jan.ai/"],
    ["localai", "Local API Stack", "runtime", "MIT-licensed local AI stack and OpenAI-compatible API for self-hosted language, image, audio, and agent workloads.", "https://localai.io/docs/overview/index.html"],
    ["deepseek", "Model Provider", "model", "DeepSeek model ecosystem for efficient reasoning, coding, and open model experimentation.", "https://www.deepseek.com/"],
    ["qwen", "Model Provider", "model", "Alibaba's Qwen model family and assistant ecosystem for open and hosted reasoning, coding, and multimodal work.", "https://qwen.ai/"],
    ["gemma", "Model Family", "model", "Google's lightweight open model family for local, cloud, and deployable AI applications.", "https://ai.google.dev/gemma"],
    ["gpt-oss", "Open-Weight Models", "model", "OpenAI's open-weight reasoning models also belong in the wider self-hosted open model stack.", "https://openai.com/open-models"],
    ["groq-cloud", "Inference Provider", "model_hosting", "Low-latency hosted inference option frequently used for supported open models.", "https://console.groq.com/"],
  ],
};

const placeholderSlugsByEcosystem = {
  anthropic: ["chatgpt", "fastai", "deepl-translator", "davinci-resolve"],
};

function buildGuidance({ toolName, ecosystemName, roleCategory, integrationType, summary }) {
  const examplesByType = {
    official_product: ["Explore the ecosystem UI", "Draft and refine knowledge work", "Validate workflow fit before automating"],
    api_platform: ["Set up keys and billing", "Test model behavior", "Ship production integrations"],
    api: ["Add model calls to an app", "Stream responses", "Connect tools and structured outputs"],
    sdk: ["Build repeatable agents", "Wrap internal tools", "Add traces and guardrails"],
    protocol: ["Connect private data", "Expose internal tools", "Standardize agent integrations"],
    model: ["Run model evaluations", "Self-host private workloads", "Prototype with open weights"],
    model_product: ["Create visual assets", "Iterate campaign concepts", "Generate product imagery"],
    agent_tool: ["Automate terminal tasks", "Inspect codebases", "Chain shell and file operations"],
    runtime: ["Run local models", "Serve OpenAI-compatible endpoints", "Test private inference stacks"],
    model_hub: ["Compare models", "Find datasets", "Share model cards and demos"],
    model_hosting: ["Avoid hosting your own GPUs", "Deploy model APIs quickly", "Scale inference experiments"],
    interface: ["Give teams a private chat UI", "Connect local and hosted models", "Add RAG workflows"],
    enterprise: ["Roll out governed AI", "Manage secure team access", "Centralize admin controls"],
  };

  const bestForByType = {
    official_product: `Daily ${ecosystemName} workflows`,
    api_platform: "Production app setup and governance",
    api: "Application-level model integration",
    sdk: "Custom agents and repeatable workflows",
    protocol: "Tool and data-source connectivity",
    model: "Open-weight or provider model strategy",
    model_product: "Creative generation workflows",
    agent_tool: "Developer automation",
    runtime: "Local or private inference",
    model_hub: "Model discovery and evaluation",
    model_hosting: "Hosted open-model inference",
    interface: "Self-hosted user experience",
    enterprise: "Organization-wide rollout",
  };

  const howByType = {
    official_product: `Start in ${toolName} for hands-on exploration, then move repeatable or production tasks into the matching API, SDK, or platform layer.`,
    api_platform: `Use ${toolName} to create credentials, test prompts, inspect usage, and manage the production surface for this ecosystem.`,
    api: `Add ${toolName} behind a focused feature first, capture inputs and outputs, then expand once quality and cost are predictable.`,
    sdk: `Use ${toolName} when the workflow needs tools, handoffs, permissions, tracing, or repeated agent behavior.`,
    protocol: `Use ${toolName} to expose well-scoped tools and data sources to assistants without baking every integration into one app.`,
    model: `Benchmark ${toolName} against your task data, then choose hosting, quantization, and safety controls based on latency and privacy needs.`,
    model_product: `Use ${toolName} during creative exploration, then keep final review and brand checks in your normal production workflow.`,
    agent_tool: `Run ${toolName} in a contained repo or terminal workspace, review proposed changes, and keep tests in the loop.`,
    runtime: `Install ${toolName}, pull a small model first, verify hardware fit, then expose a local API only when the workflow is stable.`,
    model_hub: `Use ${toolName} to shortlist models, read cards and licenses, test demos, then deploy through your preferred runtime or host.`,
    model_hosting: `Use ${toolName} for fast hosted experiments or production APIs when you do not want to manage model infrastructure.`,
    interface: `Deploy ${toolName} as the team-facing UI and connect it to trusted local, hosted, or OpenAI-compatible backends.`,
    enterprise: `Start with ${toolName} when procurement, admin controls, compliance, or team-wide governance matter more than individual experimentation.`,
  };

  return {
    when_to_use: `Use ${toolName} when you need ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`,
    how_to_use: howByType[integrationType] || `Start with a narrow ${roleCategory.toLowerCase()} workflow, validate output quality, then expand usage once the team has a repeatable process.`,
    best_for: bestForByType[integrationType] || roleCategory,
    use_case_examples: examplesByType[integrationType] || [`Evaluate ${toolName}`, `Build with ${ecosystemName}`, "Compare alternatives"],
    recommendation: `${toolName} is best mapped as the ${roleCategory.toLowerCase()} layer in the ${ecosystemName} ecosystem.`,
    caveats: integrationType === "official_product"
      ? "For repeatable automation or production apps, pair this with the ecosystem's API or developer platform."
      : "Confirm current pricing, availability, limits, and license terms before depending on it in production.",
  };
}

async function hasExtendedEcosystemToolColumns() {
  const { error } = await supabase
    .from("ecosystem_tools")
    .select("display_order,when_to_use,how_to_use,best_for,use_case_examples,recommendation,caveats")
    .limit(1);
  return !error;
}

async function main() {
  console.log("Seeding researched ecosystem tools...");

  const toolSlugs = tools.map((tool) => tool.slug);
  const { data: existingTools, error: existingToolsError } = await supabase
    .from("tools")
    .select("id, slug, name")
    .in("slug", toolSlugs);

  if (existingToolsError) throw existingToolsError;

  const existingToolSlugs = new Set((existingTools || []).map((tool) => tool.slug));
  const newlyCreatedToolSlugs = toolSlugs.filter((slug) => !existingToolSlugs.has(slug));

  const { data: upsertedEcosystems, error: ecoError } = await supabase
    .from("ecosystems")
    .upsert(ecosystems, { onConflict: "slug" })
    .select("id, slug, name");

  if (ecoError) throw ecoError;

  const { data: upsertedTools, error: toolError } = await supabase
    .from("tools")
    .upsert(tools, { onConflict: "slug" })
    .select("id, slug, name");

  if (toolError) throw toolError;

  const ecosystemBySlug = new Map((upsertedEcosystems || []).map((ecosystem) => [ecosystem.slug, ecosystem]));
  const toolBySlug = new Map((upsertedTools || []).map((tool) => [tool.slug, tool]));
  const extendedColumns = await hasExtendedEcosystemToolColumns();

  const linkRows = [];
  for (const [ecosystemSlug, entries] of Object.entries(relations)) {
    const ecosystem = ecosystemBySlug.get(ecosystemSlug);
    if (!ecosystem) throw new Error(`Missing ecosystem: ${ecosystemSlug}`);

    entries.forEach((entry, index) => {
      const [toolSlug, roleCategory, integrationType, summary, sourceUrl, contentStatus = "active"] = entry;
      const tool = toolBySlug.get(toolSlug);
      if (!tool) throw new Error(`Missing tool: ${toolSlug}`);

      const row = {
        ecosystem_id: ecosystem.id,
        tool_id: tool.id,
        role_category: roleCategory,
      };

      if (extendedColumns) {
        const guidance = buildGuidance({
          toolName: tool.name,
          ecosystemName: ecosystem.name,
          roleCategory,
          integrationType,
          summary,
        });

        Object.assign(row, {
          display_order: index + 1,
          integration_type: integrationType,
          ecosystem_summary: summary,
          ...guidance,
          is_official: ["official_product", "api_platform", "api", "sdk", "protocol", "model"].includes(integrationType),
          source_url: sourceUrl,
          content_status: contentStatus,
          updated_at: new Date().toISOString(),
        });
      }

      linkRows.push(row);
    });
  }

  const { error: linkError } = await supabase
    .from("ecosystem_tools")
    .upsert(linkRows, { onConflict: "ecosystem_id,tool_id" });

  if (linkError) throw linkError;

  const staleIds = [];
  for (const [ecosystemSlug, slugs] of Object.entries(placeholderSlugsByEcosystem)) {
    const ecosystem = ecosystemBySlug.get(ecosystemSlug);
    if (!ecosystem) continue;

    const { data: staleLinks, error: staleError } = await supabase
      .from("ecosystem_tools")
      .select("id, tools!inner(slug)")
      .eq("ecosystem_id", ecosystem.id)
      .in("tools.slug", slugs);

    if (staleError) throw staleError;
    staleIds.push(...(staleLinks || []).map((link) => link.id));
  }

  if (staleIds.length > 0) {
    const { error: pruneError } = await supabase.from("ecosystem_tools").delete().in("id", staleIds);
    if (pruneError) throw pruneError;
  }

  console.log(
    JSON.stringify(
      {
        ecosystems_upserted: upsertedEcosystems.length,
        tools_upserted: upsertedTools.length,
        ecosystem_links_upserted: linkRows.length,
        stale_placeholder_links_removed: staleIds.length,
        rich_ecosystem_tool_columns_detected: extendedColumns,
        newly_created_tool_slugs: newlyCreatedToolSlugs,
      },
      null,
      2
    )
  );

  if (!extendedColumns) {
    console.log("Note: run lib/supabase/schema_update_v9_ecosystem_tools_content.sql, then rerun this script to backfill relationship summaries, guidance, and ordering.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
