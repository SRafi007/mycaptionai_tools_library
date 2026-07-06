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

const playbooks = [
  {
    title: "Build Executive Briefs: Turn Raw Research Into Decision-Ready Strategic Memos",
    slug: "build-executive-briefs-raw-research-strategic-memos",
    description:
      "Stop wasting hours drowning in open tabs and chaotic research papers. This playbook is your automated executive synthesis machine. Seamlessly chain Perplexity, ChatGPT, NotebookLM, Claude, and Gamma to instantly extract critical insights, construct a bulletproof cited decision memo, and auto-generate client-ready presentations that command authority.",
    ecosystem_slug: null,
    target_user: "Founders, analysts, marketers, consultants, and operators who need a defensible brief quickly.",
    outcome: "A cited research memo, decision summary, and presentation draft.",
    difficulty: "Beginner",
    estimated_time: "2-4 hours",
    best_for: "Market scans, competitor research, vendor comparison, and internal strategy notes.",
    prerequisites: ["A clear research question", "A list of trusted sources or competitors", "A desired output format"],
    source_urls: [
      "https://help.openai.com/articles/10500283",
      "https://support.google.com/notebooklm/answer/16212820",
      "https://www.perplexity.ai/",
      "https://gamma.app/products/documents",
    ],
    steps: [
      ["perplexity-search", "Find current source material", "Use Perplexity first to collect recent, citable sources and map the major viewpoints around the question.", "A research question and constraints.", "A shortlist of source links and claims to verify.", "Perplexity is strongest as the first pass because it searches the web and surfaces citations instead of only drafting from memory."],
      ["chatgpt", "Plan the brief", "Ask ChatGPT to turn the source list into a research plan, identify gaps, and define the structure of the final memo.", "Source links and the intended audience.", "A brief outline, open questions, and a synthesis plan.", "ChatGPT is useful for decomposing a broad research task into sections and deciding what evidence is still missing."],
      ["notebooklm", "Ground the analysis in uploaded sources", "Upload PDFs, docs, transcripts, and source pages into NotebookLM, then ask source-grounded questions and pull quotes or facts into the memo outline.", "Primary sources, PDFs, or copied notes.", "Grounded answers and source-backed notes.", "NotebookLM is valuable when the visitor wants answers anchored to an explicit source set."],
      ["claude", "Draft the analytical memo", "Move the outline and grounded notes into Claude and ask for a concise executive brief with assumptions, risks, and recommendations separated.", "Research notes and memo outline.", "A polished long-form brief.", "Claude is strong at long-form synthesis, structured writing, and careful wording."],
      ["gamma", "Convert the brief into a deck", "Use Gamma to convert the finished memo into a leadership-ready presentation or shareable document.", "Final memo and audience context.", "A deck or document that can be shared with stakeholders.", "Gamma turns long-form analysis into a visually organized deliverable without starting from a blank slide deck."],
    ],
  },
  {
    title: "High-Rank SEO Engine: Publish High-Value Articles That Dominate Google Search",
    slug: "high-rank-seo-engine-publish-articles-dominate-google",
    description:
      "Stop publishing generic AI spam that gets penalized by search engines. This advanced editorial framework blends deep SERP research with structured writing systems and human editorial polish. Discover how to create search-optimized, genuinely helpful articles with complete distribution packages that capture traffic and drive organic revenue on autopilot.",
    ecosystem_slug: null,
    target_user: "Blog owners, affiliate marketers, agencies, and in-house content teams.",
    outcome: "A researched article package with outline, draft, visuals, and social distribution copy.",
    difficulty: "Beginner",
    estimated_time: "3-6 hours per article",
    best_for: "Comparison posts, educational guides, listicles, and product-led SEO pages.",
    prerequisites: ["Target keyword or topic", "Audience segment", "Editorial quality standard"],
    source_urls: [
      "https://help.openai.com/articles/10500283",
      "https://www.anthropic.com/claude",
      "https://www.canva.com/canva-ai/",
      "https://buffer.com/ai-assistant",
    ],
    steps: [
      ["perplexity-search", "Collect SERP and source context", "Search the topic, capture competing angles, common questions, and authoritative sources before drafting.", "Keyword, audience, and region.", "Research notes and SERP patterns.", "It gives the content team current context and citations before any generation starts."],
      ["chatgpt", "Create the search-intent outline", "Ask ChatGPT to group findings into a heading structure, search intent, FAQ targets, and internal-link opportunities.", "Research notes and keyword.", "A structured content brief.", "ChatGPT is effective for turning scattered research into an actionable writing brief."],
      ["claude", "Draft the article", "Use Claude to write the first draft from the approved outline, with instructions for tone, reader level, and evidence boundaries.", "Approved outline and source notes.", "A complete article draft.", "Claude handles long-form writing and editorial structure well, especially when source notes are supplied."],
      ["grammarly", "Edit for clarity and tone", "Run the draft through Grammarly to tighten grammar, clarity, sentence length, and tone before publication review.", "Article draft.", "Cleaner copy ready for human review.", "It catches mechanical issues that often remain after LLM drafting."],
      ["canva", "Create featured and social visuals", "Use Canva to create a featured image, charts, carousels, and reusable social templates from the final article angle.", "Headline, key stats, and brand guidelines.", "Visual assets for the article and distribution.", "Canva is fast for non-designers and supports AI-assisted design workflows."],
      ["buffer", "Schedule distribution", "Queue the article announcement, follow-up snippets, and visual posts in Buffer across the relevant social channels.", "Final URL and social copy.", "Scheduled social promotion.", "Buffer keeps promotion from being an afterthought after publishing."],
    ],
  },
  {
    title: "Short-Form Viral Factory: Create High-Retention Social Videos in Minutes",
    slug: "short-form-viral-factory-create-high-retention-videos",
    description:
      "Crack the short-form algorithm without ever staring at a blank screen. This complete end-to-end video engine takes you from basic idea to high-retention video in minutes. Learn how to write high-hook scripts, generate hyper-realistic voiceovers and custom B-roll footage, edit for retention, and schedule across all social networks.",
    ecosystem_slug: null,
    target_user: "Creators, social teams, educators, and small brands producing repeatable short-form video.",
    outcome: "A finished 15-60 second vertical video with captions and publishing assets.",
    difficulty: "Intermediate",
    estimated_time: "1-3 hours per clip",
    best_for: "Product explainers, listicle videos, founder clips, educational snippets, and ad variants.",
    prerequisites: ["Video topic", "Target platform", "Brand voice", "Basic visual style"],
    source_urls: [
      "https://runwayml.com/product",
      "https://help.runwayml.com/hc/en-us/articles/42460036199443-Text-to-Video-Prompting-Guide",
      "https://elevenlabs.io/dubbing",
      "https://www.canva.com/canva-ai/",
    ],
    steps: [
      [
        "chatgpt", 
        "Write hooks and script options", 
        "Generate multiple hook angles, a tight spoken script, B-roll notes, and caption-safe on-screen text.", 
        "Topic, audience, and platform.", 
        "Script variants and shot notes.", 
        "ChatGPT is fast for testing many hooks before committing to production.",
        "llm",
        "script-prompt.txt",
        "Act as a short-form video scriptwriter.\n\nTopic: {topic}\nPlatform: TikTok / Reels / Shorts\nLength: 30-45 seconds\n\nGive me:\n1. 5 scroll-stopping hook lines (under 8 words each)\n2. A tight spoken script for the strongest hook, ~110 words\n3. B-roll notes every 2-3 sentences\n4. Caption-safe on-screen text overlays\n\nKeep it conversational, avoid clichés, write for a viewer deciding to keep watching in the first 1.5 seconds."
      ],
      [
        "elevenlabs", 
        "Generate or localize voiceover", 
        "Create a natural voiceover or use dubbing for localization while preserving emotion and timing.", 
        "Approved script and voice direction.", 
        "Voiceover audio in the target language.", 
        "ElevenLabs is useful for fast narration and multilingual voice workflows.",
        "audio",
        "voice-settings.txt",
        "Voice: warm, confident, mid-pace narrator\nStability: 45%  ·  Similarity: 80%  ·  Style: 25%\n\nInstructions:\n1. Paste the final spoken script from Stage 1.\n2. Generate the English voiceover first and lock the timing.\n3. For localization, use Dubbing (not TTS-from-translation) so pacing and emotion carry over.\n4. Export 48kHz WAV, trim head/tail silence before sending to the edit stage."
      ],
      [
        "runway", 
        "Generate visual clips", 
        "Use Runway to create text-to-video or image-to-video B-roll, motion scenes, and stylized shots that match the script.", 
        "Shot prompts, reference images, or product imagery.", 
        "Short generated clips for the edit.", 
        "Runway is built around AI video generation and editing, so it fits the generative footage step.",
        "video",
        "clip-prompt.txt",
        "Generate 4-6 B-roll clips, 4s each, 9:16 vertical ratio.\n\nStyle reference: {moodboard image}\nMotion: slow push-in, handheld micro-shake, natural light\nSubject: {scene description from script}\nAvoid: text artifacts, warped hands, logo-like shapes\n\nUse image-to-video when a brand asset exists; text-to-video for abstract or establishing shots."
      ],
      [
        "capcut", 
        "Edit, caption, and format", 
        "Assemble clips, voiceover, music, captions, pacing, and platform-specific ratios in CapCut.", 
        "Clips, voiceover, logo, and caption copy.", 
        "Final vertical video.", 
        "CapCut is a practical editing layer for fast social video assembly.",
        "edit",
        "edit-checklist.txt",
        "CapCut Timeline Editing Checklist:\n1. Drop clips on the timeline in script order, trim to the voiceover audio track.\n2. Add auto-captions, then hand-edit for readability and accuracy (max 4 words per line).\n3. Layer background music at -18dB under voice, ducking background audio by -6dB during speech.\n4. Export: 1080x1920 (Reels/TikTok), 1080x1350 (feed), 1920x1080 (YouTube).\n5. Add a 0.5s black-frame pad at the start for autoplay-crop platforms."
      ],
      [
        "canva", 
        "Create thumbnail and post creative", 
        "Design the cover frame, carousel companion asset, or ad-safe thumbnail in Canva.", 
        "Final title, video frame, and brand colors.", 
        "Thumbnail and supporting creative.", 
        "Canva gives non-editors quick visual polish around the video.",
        "image",
        "thumbnail-dimensions.txt",
        "Build a thumbnail or cover frame that matches the hook, for platforms that show one.\n\nDimensions:\n- Instagram Reels: 1080 x 1920 (grid crop: 1080 x 1080 center)\n- YouTube Shorts: 1080 x 1920 (auto-selected or custom)\n- TikTok: 1080 x 1920\n\nEnsure text overlays are centered within the 1:1 safe zone so they don't get cropped in feed grid views."
      ],
      [
        "buffer", 
        "Schedule and test copy", 
        "Schedule the finished clip with two or three caption variants and track what angle performs best.", 
        "Video file and post copy.", 
        "Scheduled publishing plan.", 
        "Buffer helps make production repeatable across channels.",
        "schedule",
        "buffer-schedule.txt",
        "Queue the export across platforms at the right local time for each audience.\n\nSchedule guidelines:\n1. Hook-first post copy (max 140 chars for preview safety)\n2. Add custom thumbnail frame on Instagram\n3. Schedule for peak hours: 12 PM and 6 PM local viewer time\n4. Pin the first comment with relevant link calls-to-action"
      ],
    ],
  },
  {
    title: "Omnichannel Creator System: Turn One Podcast Into Ten High-Traffic Social Assets",
    slug: "omnichannel-creator-system-turn-podcast-into-social-assets",
    description:
      "Stop leaving traffic on the table. Turn every single podcast episode, expert interview, or webinar into a massive multi-channel content engine. Automatically generate engaging video clips, comprehensive show notes, custom visual quote cards, newsletters, and promotional social posts that extend your brand reach across the web.",
    ecosystem_slug: null,
    target_user: "Podcasters, webinar teams, creator-led companies, and B2B marketers.",
    outcome: "One polished episode plus clips, notes, captions, thumbnails, and social copy.",
    difficulty: "Intermediate",
    estimated_time: "3-8 hours after recording",
    best_for: "Podcasts, interviews, webinars, customer stories, and expert roundtables.",
    prerequisites: ["Raw recording", "Guest/topic notes", "Publishing channels"],
    source_urls: [
      "https://riverside.com/",
      "https://riverside.com/video-editor",
      "https://podcast.adobe.com/en",
      "https://www.descript.com/overdub-fb",
    ],
    steps: [
      ["riverside", "Record and generate the first edit", "Record or upload the session, use transcription, chapters, show notes, and AI clips to create the first content package.", "Raw recording or scheduled recording session.", "Transcript, episode draft, show notes, and clips.", "Riverside combines recording, text-based editing, clips, and publishing-oriented assets."],
      ["adobe-podcast", "Clean spoken audio", "Run noisy tracks through Adobe Podcast Enhance Speech before final editing or clip creation.", "Audio or video file with dialogue.", "Cleaner, more intelligible speech track.", "Adobe Podcast is focused on browser-based speech enhancement and audio cleanup."],
      ["descript", "Edit by transcript", "Use Descript to remove filler words, trim sections by editing text, add captions, and fix small narration mistakes.", "Transcript and cleaned audio/video.", "Polished episode and captioned clips.", "Descript is strong for transcript-based video and podcast editing."],
      ["chatgpt", "Write derivative assets", "Turn the transcript into show notes, newsletters, article outlines, quote cards, and social post variations.", "Transcript and episode angle.", "Written promotional assets.", "ChatGPT handles repetitive derivative writing once the source content is clear."],
      ["canva", "Package visuals", "Create thumbnails, audiograms, quote cards, and social graphics using the episode theme and guest imagery.", "Episode title, quotes, and screenshots.", "Brand-ready visual assets.", "Canva is an efficient design layer for non-designers."],
      ["buffer", "Schedule the rollout", "Schedule launch post, clip posts, quote posts, and follow-up reminders over multiple days.", "Final links, clips, and copy.", "Multi-day content calendar.", "Buffer makes the episode distribution plan operational."],
    ],
  },
  {
    title: "Elite Developer Sprint Engine: Ship Tested Code Ten Times Faster With AI",
    slug: "elite-developer-sprint-engine-ship-tested-code-faster",
    description:
      "Supercharge your engineering throughput without sacrificing quality or system control. This elite workflow integrates Claude Code, Cursor, GitHub Copilot, and Gemini to automate repository exploration, feature implementation, and rigorous code reviews while maintaining absolute unit testing and code safety standards.",
    ecosystem_slug: "anthropic",
    target_user: "Software engineers, technical founders, and product teams shipping code with AI assistants.",
    outcome: "A planned, implemented, reviewed, and tested feature branch.",
    difficulty: "Advanced",
    estimated_time: "Half-day to 2 days",
    best_for: "Feature spikes, bug fixes, refactors, documentation upgrades, and test coverage work.",
    prerequisites: ["Git repo", "Local test command", "Issue or feature brief", "Human review owner"],
    source_urls: [
      "https://claude.com/product/claude-code",
      "https://openai.com/codex",
      "https://docs.cursor.com/",
      "https://cloud.google.com/gemini/docs/codeassist/overview",
    ],
    steps: [
      ["claude-code", "Explore and plan the change", "Ask Claude Code to inspect the repo, identify relevant files, propose a bounded implementation plan, and surface risks before edits.", "Issue brief and repo access.", "A technical plan and target files.", "Claude Code is designed for codebase-aware terminal and IDE workflows."],
      ["cursor-2", "Implement focused edits", "Use Cursor Agent for multi-file changes where the developer can watch diffs, steer context, and keep implementation close to the editor.", "Plan and selected files.", "Working code changes.", "Cursor is useful when the engineer wants AI edits inside the coding environment."],
      ["copilot", "Fill small code gaps", "Use GitHub Copilot for inline completions, boilerplate, tests, and small local edits during implementation.", "Open file context.", "Faster local coding throughput.", "Copilot is efficient for autocomplete-style assistance and local code suggestions."],
      ["codex", "Run a second engineering pass", "Use Codex for review, alternative implementation ideas, bug hunting, and test suggestions before final PR review.", "Diff and test output.", "Review notes and fixes.", "A second agent reduces single-assistant blind spots."],
      ["gemini-code-assist", "Check enterprise or Google-stack concerns", "Use Gemini Code Assist when the stack touches Google Cloud, large code review surfaces, or IDE-integrated enterprise workflows.", "Final diff and deployment context.", "Additional code review and cloud-specific feedback.", "Gemini Code Assist is well placed for IDE and code-review workflows in Google environments."],
    ],
  },
  {
    title: "Rapid SaaS Builder: Launch Working Web Applications Without Writing Code",
    slug: "rapid-saas-builder-launch-working-web-apps-no-code",
    description:
      "Turn your million-dollar idea into a fully functional, interactive software application in record time. Skip the slow, expensive development cycles and use natural language to generate robust frontends, backends, databases, and authentication. Design and launch a real working MVP to start collecting user feedback today.",
    ecosystem_slug: null,
    target_user: "Founders, product managers, indie hackers, and agencies testing product ideas.",
    outcome: "A working prototype or early app that can be reviewed with users.",
    difficulty: "Intermediate",
    estimated_time: "1-3 days",
    best_for: "MVP screens, internal tools, booking apps, dashboards, marketplaces, and SaaS concepts.",
    prerequisites: ["Product problem statement", "Target user", "Core workflow", "Data entities"],
    source_urls: [
      "https://docs.lovable.dev/",
      "https://support.bolt.new/building/intro-bolt",
      "https://replit.com/",
      "https://docs.cursor.com/",
    ],
    steps: [
      ["chatgpt", "Define the product spec", "Turn the idea into user roles, core flows, data entities, acceptance criteria, and launch constraints.", "Idea and target customer.", "Prototype brief and screen list.", "A clear prompt spec improves every downstream app-builder result."],
      ["lovable", "Generate the first full-stack app", "Use Lovable to create the app structure, frontend, backend, auth, database, and integrations from the spec.", "Prototype brief.", "A first working web application.", "Lovable is positioned for natural-language full-stack app generation with editable code."],
      ["bolt-new", "Explore alternative UX quickly", "Use Bolt.new to generate a second UI direction or a smaller standalone workflow for comparison.", "Same spec or one focused workflow.", "Alternative prototype direction.", "Bolt is fast for prompt-to-working-product experiments."],
      ["replit", "Host and inspect the prototype", "Use Replit to run, test, and share the app when the team needs a browser-based development environment.", "Prototype code or generated app.", "Runnable shared prototype.", "Replit is useful for browser-based coding, collaboration, and deployment checks."],
      ["cursor-2", "Clean up the generated code", "Use Cursor to inspect generated code, rename confusing pieces, remove obvious duplication, and prepare the prototype for handoff.", "Generated repository.", "Cleaner codebase and implementation notes.", "Generated prototypes still need engineering cleanup before serious use."],
    ],
  },
  {
    title: "High-Converting Sales Pipeline: Book Personalized Outbound Meetings on Autopilot",
    slug: "high-converting-sales-pipeline-book-outbound-meetings",
    description:
      "Tired of cold emailing into a black hole? This cutting-edge sales pipeline helps SDRs and founders enrich hyper-targeted prospect lists, extract custom personalization triggers, write compelling hyper-focused email sequences, and sync every interaction directly into HubSpot for predictable, scaleable outbound revenue.",
    ecosystem_slug: null,
    target_user: "B2B founders, SDR teams, agencies, and revenue operators.",
    outcome: "A researched account list, personalized sequence, and CRM-tracked outbound campaign.",
    difficulty: "Intermediate",
    estimated_time: "1-2 days to launch a campaign",
    best_for: "Niche account-based outreach, founder-led sales, and new-market testing.",
    prerequisites: ["ICP", "Offer", "Proof points", "Sending domain and CRM setup"],
    source_urls: [
      "https://openai.com/index/clay/",
      "https://www.apollo.io/product/sales-engagement",
      "https://www.apollo.io/ai",
      "https://www.hubspot.com/products/artificial-intelligence",
    ],
    steps: [
      ["clay", "Build and enrich the account list", "Use Clay to gather target accounts, enrich firmographic data, and research trigger events or personalization hooks.", "ICP and account filters.", "Enriched account and lead table.", "Clay is strong for enrichment and agentic sales research."],
      ["apollo", "Validate contacts and channels", "Use Apollo to find verified contacts, build lead lists, and prepare multichannel outreach paths.", "Target accounts and personas.", "Contact list with outreach data.", "Apollo combines prospecting data and sales engagement workflows."],
      ["claude", "Write personalized messaging", "Feed account insights into Claude and create concise email, LinkedIn, and call-note variants for each segment.", "Lead context and offer.", "Message variants for review.", "Claude is useful for nuanced B2B personalization without bloated copy."],
      ["regie", "Create campaign structure", "Use Regie to turn messaging into a repeatable sequence framework for prospecting and follow-up.", "Message variants and campaign goal.", "Sequence copy and cadence.", "Regie fits the sales-content and prospecting automation layer."],
      ["replyio", "Run and monitor outreach", "Load reviewed copy into Reply.io, run the sequence, and monitor replies, deliverability, and engagement.", "Approved contact list and cadence.", "Live outbound campaign.", "Reply.io handles outreach execution and analytics."],
      ["hubspot", "Sync outcomes to CRM", "Log replies, meetings, lifecycle stage changes, and campaign performance in HubSpot.", "Campaign responses and CRM fields.", "Clean CRM records and follow-up tasks.", "HubSpot keeps sales actions connected to the customer record."],
    ],
  },
  {
    title: "Zero-Friction Support Automation: Build Context-Aware AI Helpdesks With Escalation Loops",
    slug: "zero-friction-support-automation-build-context-aware-ai-helpdesk",
    description:
      "Scale your customer success without hiring an army of agents. Deploy a sophisticated, context-aware support ecosystem that instantly answers routine customer inquiries, handles complex ticket resolution, and seamlessly routes high-priority tickets to human representatives, turning customer support into a competitive advantage.",
    ecosystem_slug: null,
    target_user: "Support leaders, SaaS operators, customer success teams, and founders.",
    outcome: "An AI-assisted support workflow with knowledge base, escalation rules, and feedback loops.",
    difficulty: "Intermediate",
    estimated_time: "3-10 days depending on documentation quality",
    best_for: "SaaS helpdesks, ecommerce support, internal IT support, and product knowledge bases.",
    prerequisites: ["Existing FAQ or docs", "Support categories", "Escalation policy", "Helpdesk owner"],
    source_urls: [
      "https://fin.ai/",
      "https://www.intercom.com/blog/fin-ai-bot-customer-service/",
      "https://www.hubspot.com/products/artificial-intelligence",
      "https://knowledge.hubspot.com/ai/use-breeze",
    ],
    steps: [
      ["notion-ai", "Prepare support knowledge", "Consolidate product docs, FAQs, policies, and troubleshooting notes into a cleaner knowledge base.", "Existing docs and ticket history.", "Organized source knowledge.", "AI support quality depends on the quality of source documentation."],
      ["claude", "Identify gaps and rewrite articles", "Ask Claude to find missing policy details, confusing instructions, and duplicate articles, then rewrite the highest-impact docs.", "Knowledge base export and ticket examples.", "Improved support articles.", "Claude is useful for careful rewrite work and policy-sensitive explanations."],
      ["intercom", "Deploy customer-facing AI support", "Use Intercom or Fin-style AI support to answer common questions and hand off unresolved cases.", "Knowledge base and escalation rules.", "AI-assisted support entry point.", "Intercom's AI support ecosystem is built for customer-service workflows and escalation."],
      ["hubspot", "Connect support to customer records", "Sync support interactions, account context, and follow-up work into HubSpot so sales and success can see issues.", "Customer records and support categories.", "Unified customer context.", "HubSpot connects service data with CRM and broader customer workflows."],
      ["eesel-ai", "Add internal support assistant", "Use eesel AI for internal Slack, docs, and team knowledge Q&A so agents can answer faster.", "Internal docs and workspace permissions.", "Internal AI support assistant.", "Internal support teams need a private helper in addition to the public chatbot."],
    ],
  },
  {
    title: "Automated Meeting Synthesizer: Instantly Convert Conversations Into CRM Records and Tasks",
    slug: "automated-meeting-synthesizer-convert-conversations-to-crm-records",
    description:
      "Eliminate post-meeting admin work forever. This high-efficiency playbook automatically captures transcripts, flags critical action items, drafts beautifully written follow-up emails, and logs structured updates directly into your CRM. Keep your team aligned and ensure no customer promise ever slips through the cracks.",
    ecosystem_slug: null,
    target_user: "Sales teams, consultants, account managers, recruiters, and founders.",
    outcome: "Clean meeting notes, decisions, follow-up drafts, and CRM updates.",
    difficulty: "Beginner",
    estimated_time: "15-45 minutes after each meeting",
    best_for: "Sales calls, customer success check-ins, interviews, and internal planning meetings.",
    prerequisites: ["Meeting recording permission", "CRM fields", "Follow-up owner"],
    source_urls: [
      "https://fathom.video/",
      "https://otter.ai/",
      "https://www.hubspot.com/products/artificial-intelligence",
    ],
    steps: [
      ["fathom", "Record and summarize the call", "Use Fathom to record, transcribe, highlight, and summarize important meeting moments.", "Meeting recording.", "Summary, highlights, and transcript.", "Fathom is built around meeting capture and instant summaries."],
      ["otter-ai", "Capture backup transcript and action items", "Use Otter when the team needs live transcription, action items, or meeting notes across recurring sessions.", "Meeting audio or calendar integration.", "Transcript and action items.", "Otter is a practical transcription and meeting-note layer."],
      ["claude", "Turn notes into follow-up", "Ask Claude to write a follow-up email, decision log, risk list, and next-step checklist from the transcript.", "Transcript and meeting objective.", "Follow-up package.", "Claude is effective for transforming messy transcripts into polished written commitments."],
      ["notion-ai", "Store reusable knowledge", "Save decisions, FAQs, objections, and account notes in Notion so future meetings build on past context.", "Meeting summary and notes.", "Reusable team knowledge.", "Notion AI helps organize meeting knowledge into a searchable workspace."],
      ["hubspot", "Update CRM fields", "Log the summary, next step, deal stage, contact notes, and task reminders in HubSpot.", "Follow-up notes and CRM account.", "Updated customer record.", "CRM updates are the business outcome of the meeting workflow."],
    ],
  },
  {
    title: "Instant Brand Identity Creator: Design Beautiful Logos and Complete Launch Graphics",
    slug: "instant-brand-identity-creator-design-logos-launch-graphics",
    description:
      "Launch your next venture with a world-class visual presence from day one. Perfect for founders and creators, this playbook guides you through defining a laser-focused brand strategy, generating beautiful logo concepts, designing commercial-grade marketing assets, and scheduling a highly coordinated launch campaign.",
    ecosystem_slug: null,
    target_user: "Founders, creators, marketers, and small businesses launching a new brand.",
    outcome: "Brand brief, logo direction, visual style, launch assets, and social announcement plan.",
    difficulty: "Beginner",
    estimated_time: "1-2 days",
    best_for: "MVP launches, newsletters, creator brands, and small product launches.",
    prerequisites: ["Brand name or shortlist", "Audience", "Offer", "Tone preferences"],
    source_urls: [
      "https://www.canva.com/canva-ai/",
      "https://www.adobe.com/products/firefly/",
      "https://openai.com/index/dall-e",
    ],
    steps: [
      ["chatgpt", "Create the brand brief", "Define positioning, audience, tone, tagline options, messaging pillars, and launch narrative.", "Brand idea and target customer.", "Concise brand strategy brief.", "A good visual system needs a clear strategic direction first."],
      ["looka", "Generate logo directions", "Use Looka to explore logo concepts, typography, color families, and starter brand-kit options.", "Brand name and style preferences.", "Logo concepts and brand-kit ideas.", "Looka is useful for fast logo and identity exploration."],
      ["midjourney", "Explore visual mood", "Generate visual territories, campaign art directions, and reference images for the brand mood board.", "Brand brief and visual keywords.", "Mood-board imagery.", "Midjourney is strong for expressive art direction and concept visuals."],
      ["adobe-firefly", "Create commercially safer assets", "Use Adobe Firefly for editable, brand-conscious images, backgrounds, campaign visuals, or product mockups.", "Approved visual direction.", "Launch-ready creative assets.", "Firefly is positioned around creative generation and editing for brand and marketing workflows."],
      ["canva", "Package the launch kit", "Build launch graphics, profile images, social banners, pitch slides, and reusable templates.", "Logo direction and creative assets.", "Brand launch kit.", "Canva makes it practical to package a brand kit without a designer."],
      ["buffer", "Schedule launch posts", "Schedule announcement copy, founder story, feature posts, and follow-up reminders.", "Launch assets and social copy.", "Launch distribution calendar.", "Buffer turns the brand kit into a coordinated launch sequence."],
    ],
  },
  {
    title: "Bulletproof Private AI: Deploy Secure Offline Language Models for Your Team",
    slug: "bulletproof-private-ai-deploy-secure-offline-models",
    description:
      "Unleash the power of state-of-the-art AI models without compromising your proprietary data. Learn how to discover, evaluate, optimize, and deploy powerful open-source models (like Llama and Mistral) entirely offline on your local hardware or self-hosted servers with a beautiful, team-ready web interface.",
    ecosystem_slug: "open-source",
    target_user: "Developers, privacy-conscious teams, researchers, and technical operators.",
    outcome: "A local or self-hosted AI workspace using open models.",
    difficulty: "Advanced",
    estimated_time: "Half-day to 2 days",
    best_for: "Private model testing, offline experimentation, internal assistants, and self-hosted chat.",
    prerequisites: ["A capable laptop or server", "Basic terminal comfort", "Model license review"],
    source_urls: [
      "https://huggingface.co/",
      "https://ollama.com/",
      "https://lmstudio.ai/",
      "https://openwebui.com/",
      "https://github.com/ggml-org/llama.cpp",
      "https://localai.io/docs/overview/index.html",
    ],
    steps: [
      ["hugging-face-hub", "Choose candidate models", "Compare model cards, licenses, sizes, benchmarks, and community notes before downloading anything.", "Use case and hardware limits.", "Shortlist of models to test.", "Hugging Face Hub is the discovery layer for open models and datasets."],
      ["ollama", "Run the first local model", "Install Ollama, pull a small model, and test chat, summarization, and coding prompts locally.", "Model shortlist.", "Working local model runtime.", "Ollama is a simple way to run and test open models locally."],
      ["lm-studio", "Compare desktop model behavior", "Use LM Studio to load models, inspect performance, and expose a local server for app experiments.", "Downloaded or hub-selected model.", "Desktop model comparison and local endpoint.", "LM Studio is accessible for local model testing and private chat."],
      ["open-webui", "Create a team-facing interface", "Connect Open WebUI to the local backend so non-technical users can chat with approved models.", "Local model endpoint.", "Self-hosted chat UI.", "Open WebUI provides the user interface layer for local and hosted backends."],
      ["llama-cpp", "Optimize low-level inference", "Use llama.cpp when the team needs GGUF, quantization, CPU/GPU backend tuning, or embedded inference.", "Selected model and hardware profile.", "Optimized runtime path.", "llama.cpp is a core runtime for local inference and quantized models."],
      ["localai", "Expose OpenAI-compatible APIs", "Use LocalAI when internal apps need OpenAI-style endpoints for private model serving.", "Model files and app integration plan.", "Self-hosted API endpoint.", "LocalAI helps teams swap hosted APIs for local OpenAI-compatible services."],
    ],
  },
  {
    title: "Production-Ready Agent Builder: Build Stateful, Tool-Using AI Automated Agents",
    slug: "production-ready-agent-builder-stateful-tool-using-ai-agents",
    description:
      "Go beyond basic chatbots. Master the tools needed to build autonomous, reliable, and observable AI agents. Learn to design structured models, build custom API tools, orchestrate complex state charts using LangGraph or n8n, and deploy production-grade automated agents that work for your business 24/7.",
    ecosystem_slug: "openai",
    target_user: "Developers and technical teams building production AI features.",
    outcome: "A first production agent workflow with model calls, tools, automation, and handoff points.",
    difficulty: "Advanced",
    estimated_time: "2-5 days for an MVP",
    best_for: "Internal agents, customer workflows, search assistants, and workflow automation.",
    prerequisites: ["Product requirement", "Tool/API list", "Security boundaries", "Logging plan"],
    source_urls: [
      "https://platform.openai.com/docs/guides/responses-vs-chat-completions",
      "https://platform.openai.com/docs",
      "https://docs.langchain.com/oss/javascript/langgraph",
      "https://docs.n8n.io/",
      "https://www.make.com/en?pc=effortlessworkflows",
    ],
    steps: [
      ["openai-responses-api", "Design the model interaction", "Use the Responses API as the core model-call layer for tool use, stateful context, multimodal input, and streaming.", "Agent task and tool requirements.", "Model interaction design.", "The Responses API is the right primitive for modern OpenAI agentic applications."],
      ["openai-api-platform", "Configure platform controls", "Set up API keys, model choices, usage limits, safety settings, and evaluation checkpoints in the OpenAI platform.", "Project and environment requirements.", "Configured development environment.", "Production work needs platform-level controls before broad usage."],
      ["langchain", "Build controlled orchestration", "Use LangChain or LangGraph to define the agent graph, tools, state, human review, and observability boundaries.", "Tool list and workflow states.", "Agent orchestration layer.", "LangGraph is designed for stateful, long-running, controllable agent workflows."],
      ["n8n", "Connect business systems", "Use n8n to connect the agent with forms, tickets, sheets, CRMs, webhooks, and internal APIs.", "App integrations and credentials.", "Connected workflow automation.", "n8n adds flexible workflow automation and self-hosting options."],
      ["make", "Package visual automations", "Use Make for operator-friendly visual workflows, branching, error handling, and reusable business scenarios.", "Workflow map and app connections.", "Visual automation scenarios.", "Make helps non-developer operators understand and maintain automation flows."],
    ],
  },
  {
    title: "High-Conversion Ecom Ad Factory: Generate Ad Copy and Visuals That Sell",
    slug: "high-conversion-ecom-ad-factory-generate-copy-visuals",
    description:
      "Stop wasting ad spend on creatives that don't convert. This hyper-efficient ecommerce advertising engine generates high-converting ad concepts, stunning product visuals, custom UGC-style video creatives, and channel-optimized copywriting designed to command attention, lower acquisition costs, and maximize ROAS.",
    ecosystem_slug: null,
    target_user: "Ecommerce founders, growth marketers, and small agencies.",
    outcome: "A batch of ad concepts, image creatives, product videos, captions, and posting variants.",
    difficulty: "Intermediate",
    estimated_time: "1-2 days per campaign batch",
    best_for: "Product launches, seasonal campaigns, retargeting creatives, and paid social tests.",
    prerequisites: ["Product photos", "Offer details", "Audience segments", "Brand rules"],
    source_urls: [
      "https://www.canva.com/canva-ai/",
      "https://www.adobe.com/products/firefly/",
      "https://runwayml.com/product",
    ],
    steps: [
      ["adcreativeai", "Generate ad angles", "Use Adcreative.ai to quickly produce conversion-focused ad concepts and compare hooks for each audience segment.", "Product offer and audience notes.", "Initial ad concept set.", "It is built specifically around performance ad creative generation."],
      ["chatgpt", "Write message variants", "Create benefit-led headlines, objections, UGC-style scripts, and platform-specific ad copy.", "Offer, reviews, and objections.", "Copy variants for testing.", "ChatGPT is fast at divergent messaging and ad angle exploration."],
      ["adobe-firefly", "Create product visuals", "Generate or edit backgrounds, scenes, and campaign imagery while preserving the product and brand direction.", "Product image and visual direction.", "Ad-ready image assets.", "Firefly is strong for brand and marketing visual workflows."],
      ["canva", "Package campaign creatives", "Build static ads, carousel layouts, product comparison graphics, and thumbnail variants.", "Copy and image assets.", "Campaign creative set.", "Canva turns raw concepts into usable ad formats quickly."],
      ["capcut-commerce", "Create video ads", "Use CapCut Commerce to create short product videos with captions, product shots, and social-first pacing.", "Product media and script.", "Video ad variants.", "CapCut Commerce fits ecommerce video production and social formats."],
      ["buffer", "Schedule organic variants", "Schedule organic versions of winning creative angles to validate demand outside paid campaigns.", "Creative assets and post copy.", "Organic test calendar.", "Buffer helps test messaging before or alongside paid spend."],
    ],
  },
  {
    title: "Instant Academy Builder: Convert Raw Material Into High-Impact Digital Lessons",
    slug: "instant-academy-builder-convert-raw-material-to-lessons",
    description:
      "Transform your specialized expertise into a highly profitable digital academy or world-class internal training curriculum. Ground your lessons in source material, design perfect course modules, generate engaging slide decks, create interactive quizzes, and dub voiceovers in multiple languages to scale your impact.",
    ecosystem_slug: null,
    target_user: "Educators, coaches, course creators, enablement teams, and internal trainers.",
    outcome: "Lesson outline, slides, quiz, narration, and student-facing assets.",
    difficulty: "Beginner",
    estimated_time: "1-2 days per lesson module",
    best_for: "Mini-courses, onboarding lessons, internal training, and study guides.",
    prerequisites: ["Learning objective", "Source material", "Audience level"],
    source_urls: [
      "https://support.google.com/notebooklm/answer/16212820",
      "https://gamma.app/products/documents",
      "https://elevenlabs.io/dubbing",
      "https://www.canva.com/canva-ai/",
    ],
    steps: [
      ["notebooklm", "Ground the lesson in sources", "Upload documents, notes, transcripts, or PDFs and ask NotebookLM for key concepts, summaries, and student questions.", "Source material and learning objective.", "Grounded lesson notes.", "NotebookLM keeps lesson content tied to the supplied material."],
      ["chatgpt", "Design lesson structure", "Create learning objectives, module sequence, examples, exercises, and assessment criteria.", "Grounded notes and audience level.", "Lesson plan.", "ChatGPT is useful for instructional structure and activity ideas."],
      ["gamma", "Generate the teaching deck", "Turn the lesson plan into slides or an interactive document with sections, examples, and summary pages.", "Lesson plan and examples.", "Draft deck or document.", "Gamma quickly converts structured content into polished lesson material."],
      ["quizgecko", "Create quiz and flashcards", "Generate quizzes, flashcards, and review questions from the lesson content.", "Lesson notes and objectives.", "Assessment assets.", "Quizgecko fits the quiz and study-material step."],
      ["elevenlabs", "Generate narration", "Create voiceover audio for lesson videos, summaries, or multilingual course versions.", "Script and voice direction.", "Narrated lesson audio.", "ElevenLabs is useful for narration and localization."],
      ["canva", "Package worksheets and visuals", "Create worksheets, cheat sheets, diagrams, and branded course graphics.", "Lesson outline and visual needs.", "Student-facing downloads and graphics.", "Canva makes course packaging accessible for non-designers."],
    ],
  },
  {
    title: "Thirty-Day Social Autopilot: Write and Schedule Content for a Month",
    slug: "thirty-day-social-autopilot-schedule-content-for-month",
    description:
      "Regain your freedom while maintaining a dominant, hyper-consistent social media presence. Learn how to systematically discover industry trends, plan weekly themes, write highly engaging social posts for LinkedIn, X, and Instagram, package beautiful custom design templates, and queue a full month of traffic-driving content.",
    ecosystem_slug: null,
    target_user: "Solo founders, creators, social media managers, and small marketing teams.",
    outcome: "A researched 30-day calendar with post copy, visuals, and scheduled posts.",
    difficulty: "Beginner",
    estimated_time: "1-2 days per monthly batch",
    best_for: "LinkedIn, X, Instagram, TikTok captions, newsletters, and launch campaigns.",
    prerequisites: ["Brand voice", "Content pillars", "Offer or campaign goal"],
    source_urls: [
      "https://www.perplexity.ai/",
      "https://www.semrush.com/goodcontent/ai-social-media-post-generator/",
      "https://www.canva.com/canva-ai/",
      "https://buffer.com/ai-assistant",
    ],
    steps: [
      ["perplexity-search", "Research trends and angles", "Collect timely industry topics, common questions, news hooks, and competitor content angles.", "Industry and audience.", "Trend and angle list.", "Current social content needs current context."],
      ["chatgpt", "Build the calendar framework", "Turn research into weekly themes, post formats, CTAs, and channel-specific content slots.", "Campaign goal and content pillars.", "30-day calendar outline.", "ChatGPT is useful for structuring and batching content ideas."],
      ["ai-social-media-post-generator-or-semrush", "Draft channel-specific posts", "Generate first-pass social posts and variations for each channel and campaign pillar.", "Calendar outline and target channels.", "Draft post copy.", "The Semrush social generator is purpose-built for social copy generation."],
      ["canva", "Create reusable templates", "Design post templates, carousel layouts, story frames, and announcement graphics.", "Brand assets and post themes.", "Reusable social design kit.", "Canva keeps the calendar visually consistent."],
      ["buffer", "Schedule core posts", "Queue the approved posts, captions, assets, and links into a publishing schedule.", "Approved copy and visuals.", "Scheduled calendar.", "Buffer handles straightforward social publishing across channels."],
      ["hootsuite", "Monitor and optimize", "Use Hootsuite for heavier social management needs, monitoring, engagement, and analytics across accounts.", "Published posts and channels.", "Performance and engagement workflow.", "Hootsuite fits teams that need monitoring and management beyond simple scheduling."],
    ],
  },
  {
    title: "Omnichannel Image Studio: Create Breathtaking, Brand-Consistent Marketing Visuals with AI",
    slug: "omnichannel-image-studio-create-breathtaking-marketing-visuals",
    description:
      "Stop struggling with low-quality, inconsistent AI images. Master the art of professional visual asset generation. Learn to write hyper-specific prompt structures, leverage the unique artistic strengths of Midjourney, DALL-E, and Adobe Firefly, edit assets with complete brand safety, and assemble stunning final layouts.",
    ecosystem_slug: "openai",
    target_user: "Design-adjacent marketers, creators, agencies, and startup teams.",
    outcome: "A cohesive set of campaign visuals, thumbnails, ads, and social graphics.",
    difficulty: "Intermediate",
    estimated_time: "Half-day to 2 days",
    best_for: "Campaign art, thumbnails, social images, concept boards, and ad visuals.",
    prerequisites: ["Campaign brief", "Brand constraints", "Required formats"],
    source_urls: [
      "https://openai.com/index/dall-e",
      "https://www.adobe.com/products/firefly/",
      "https://www.canva.com/canva-ai/",
    ],
    steps: [
      ["chatgpt", "Write creative directions", "Generate visual territories, prompt structures, negative constraints, and format requirements before opening image tools.", "Campaign brief and brand rules.", "Prompt pack and creative direction.", "Better prompts and constraints improve generation quality across all image models."],
      ["dalle", "Generate concept images", "Use DALL-E for quick concept exploration and image ideas from natural language prompts.", "Prompt pack.", "Initial generated concepts.", "DALL-E belongs early in the creative exploration phase."],
      ["midjourney", "Explore premium art direction", "Use Midjourney for more stylized or expressive image directions and mood-board options.", "Visual territory and style references.", "Art direction concepts.", "Midjourney is strong for polished, stylized visual exploration."],
      ["adobe-firefly", "Refine brand-safe assets", "Use Firefly to generate or edit marketing visuals, backgrounds, and campaign-ready image variants.", "Selected concepts and brand constraints.", "Refined image assets.", "Firefly fits brand and design workflows where editing matters."],
      ["freepik-ai-image-generator", "Create supporting stock-style visuals", "Generate additional backgrounds, icons, and stock-like creative variants for layouts.", "Asset list and formats.", "Supporting visual library.", "Freepik is useful for broad visual asset generation around a campaign."],
      ["canva", "Assemble final layouts", "Use Canva to create ads, thumbnails, banners, and social posts from the approved visual assets.", "Final images and copy.", "Ready-to-publish visual package.", "Canva is the layout and packaging step for campaign production."],
    ],
  },
  {
    title: "Enterprise Model Deployer: Evaluate, Benchmark and Self-Host Open-Source Models",
    slug: "enterprise-model-deployer-evaluate-benchmark-open-source-models",
    description:
      "Stop paying exorbitant API fees and regain complete model independence. This enterprise-grade playbook gives developers and ML teams the tools to systematically evaluate open models, benchmark high-throughput serving architectures using vLLM, and deploy secure, hosted or local endpoints.",
    ecosystem_slug: "open-source",
    target_user: "ML engineers, developers, AI platform teams, and privacy-focused operators.",
    outcome: "A tested open-model deployment path with local and hosted options.",
    difficulty: "Advanced",
    estimated_time: "2-5 days",
    best_for: "Model selection, cost comparison, self-hosting, and open-model product prototypes.",
    prerequisites: ["Evaluation prompts", "Hardware or hosting budget", "License requirements", "Latency target"],
    source_urls: [
      "https://huggingface.co/",
      "https://ollama.com/",
      "https://lmstudio.ai/",
      "https://github.com/vllm-project/vllm",
      "https://replicate.com/",
      "https://openwebui.com/",
    ],
    steps: [
      ["hugging-face-hub", "Shortlist model candidates", "Compare model cards, license terms, quantizations, community usage, and task fit.", "Evaluation criteria.", "Model shortlist.", "The model hub is the starting point for open-model due diligence."],
      ["ollama", "Run quick local tests", "Pull candidate models and run the same prompts locally to compare basic quality and latency.", "Prompt suite and shortlist.", "Local comparison notes.", "Ollama gives quick local signal before deeper infrastructure work."],
      ["lm-studio", "Inspect desktop usability", "Use LM Studio to test chat UX, local serving, and model behavior with non-technical reviewers.", "Candidate models.", "Reviewer-friendly local tests.", "LM Studio is useful when stakeholders need a simple desktop interface."],
      ["vllm", "Benchmark serving performance", "Use vLLM to test high-throughput serving and API compatibility for the strongest candidates.", "Selected model and benchmark prompts.", "Serving benchmark results.", "vLLM is built for production inference throughput."],
      ["replicate", "Compare hosted deployment", "Run the same model or similar alternatives on Replicate to compare setup time, cost, and operational overhead.", "Candidate model and workload estimate.", "Hosted deployment comparison.", "Replicate reduces infrastructure work for hosted model experiments."],
      ["open-webui", "Expose the chosen model to users", "Connect the selected backend to Open WebUI for testing with real users or internal teams.", "Serving endpoint and access rules.", "Usable chat interface.", "A model deployment needs a user-facing testing surface."],
    ],
  },
  {
    title: "Global Video Localizer: Translate, Voice-Dub and Lip-Sync Videos Internationally",
    slug: "global-video-localizer-translate-voice-dub-lip-sync-videos",
    description:
      "Instantly multiply your video audience by unlocking international markets. This step-by-step localization playbook teaches you to translate transcripts with flawless cultural nuance, dub high-fidelity voices with emotional resonance, lip-sync presenters perfectly, and package localized visual assets.",
    ecosystem_slug: null,
    target_user: "Creators, course teams, ecommerce brands, and global marketing teams.",
    outcome: "Localized video variants with translated scripts, dubbed audio, captions, and localized creative.",
    difficulty: "Intermediate",
    estimated_time: "Half-day to 2 days per language batch",
    best_for: "Course clips, product explainers, ads, shorts, webinars, and customer education videos.",
    prerequisites: ["Source video", "Target language", "Glossary or brand terms", "Review speaker"],
    source_urls: [
      "https://elevenlabs.io/dubbing",
      "https://podcast.adobe.com/en",
      "https://www.canva.com/canva-ai/",
    ],
    steps: [
      ["claude", "Translate and adapt the script", "Translate the script with tone, cultural context, product terms, and line-length constraints for captions.", "Original transcript and glossary.", "Localized script.", "Claude is useful for careful language adaptation beyond literal translation."],
      ["elevenlabs", "Dub the video", "Use ElevenLabs dubbing to translate audio or video while preserving timing, emotion, and speaker style where appropriate.", "Source video and target language.", "Dubbed audio/video output.", "ElevenLabs is built for AI dubbing and multilingual voice workflows."],
      ["heygen", "Create avatar or presenter variants", "Use HeyGen when the localized version needs an avatar, presenter-style clip, or lip-synced spokesperson video.", "Localized script and brand direction.", "Localized presenter video.", "HeyGen fits avatar and translated spokesperson workflows."],
      ["adobe-podcast", "Clean localized audio", "Run the localized voice track through Adobe Podcast when audio clarity or background noise needs cleanup.", "Dubbed or recorded audio.", "Cleaner voice track.", "Audio quality matters more after translation because review is harder across languages."],
      ["capcut", "Edit captions and platform versions", "Assemble localized captions, format vertical or horizontal versions, and check timing against the final audio.", "Dubbed audio/video and captions.", "Platform-ready localized video.", "CapCut is a practical editor for captioned social video variants."],
      ["canva", "Localize thumbnails and graphics", "Create localized thumbnails, title cards, lower thirds, and social graphics in Canva.", "Localized copy and final video frame.", "Localized visual assets.", "Canva makes it easy to adapt supporting creative for each market."],
    ],
  },
];

async function hasPlaybookEditorialColumns() {
  const { error } = await supabase
    .from("playbooks")
    .select("target_user,outcome,difficulty,estimated_time,best_for,prerequisites,source_urls,display_order,seo_title,seo_description")
    .limit(1);
  return !error;
}

async function hasPlaybookToolEditorialColumns() {
  const { error } = await supabase
    .from("playbook_tools")
    .select("step_title,step_goal,how_to_use,input_needed,output_expected,why_this_tool,alternatives,is_required,step_kind,file_name,prompt")
    .limit(1);
  return !error;
}

async function fetchAllRows(table, columns, pageSize = 1000) {
  const rows = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);

    if (error) throw error;

    rows.push(...(data || []));

    if (!data || data.length < pageSize) {
      return rows;
    }
  }
}

function playbookRow(playbook, ecosystemBySlug, includeEditorial, index, cover_url = null) {
  const base = {
    title: playbook.title,
    slug: playbook.slug,
    description: playbook.description,
    ecosystem_id: playbook.ecosystem_slug ? ecosystemBySlug.get(playbook.ecosystem_slug)?.id ?? null : null,
    is_published: true,
    updated_at: new Date().toISOString(),
    ...(cover_url !== undefined ? { cover_url } : {}),
  };

  if (!includeEditorial) return base;

  return {
    ...base,
    target_user: playbook.target_user,
    outcome: playbook.outcome,
    difficulty: playbook.difficulty,
    estimated_time: playbook.estimated_time,
    best_for: playbook.best_for,
    prerequisites: playbook.prerequisites,
    source_urls: playbook.source_urls,
    display_order: index + 1,
    seo_title: `${playbook.title} | AI Workflow Playbook`,
    seo_description: playbook.description.slice(0, 155),
  };
}

const TOOL_KIND_MAP = {
  'chatgpt': 'llm',
  'claude': 'llm',
  'claude-code': 'llm',
  'claude-2': 'llm',
  'gemini-code-assist': 'llm',
  'notion-ai': 'llm',
  'perplexity-search': 'llm',
  'elevenlabs': 'audio',
  'adobe-podcast': 'audio',
  'descript': 'audio',
  'runway': 'video',
  'riverside': 'video',
  'opus-clip': 'video',
  'capcut': 'edit',
  'capcut-commerce': 'edit',
  'canva': 'image',
  'adobe-firefly': 'image',
  'dalle': 'image',
  'midjourney': 'image',
  'buffer': 'schedule',
  'hootsuite': 'schedule',
  'youtube-studio': 'chart',
  'hubspot': 'chart',
};

function stepRow(playbookId, toolId, step, index, includeEditorial) {
  const toolSlug = step[0];
  const step_title = step[1];
  const step_description = step[2];
  const input_needed = step[3];
  const output_expected = step[4];
  const why_this_tool = step[5];

  // Optional columns
  const explicitKind = step[6];
  const file_name = step[7] || 'stage.txt';
  const prompt = step[8] || 'Add step instructions here.';

  const inferredKind = TOOL_KIND_MAP[toolSlug] || 'other';
  const step_kind = explicitKind || inferredKind;

  const base = {
    playbook_id: playbookId,
    tool_id: toolId,
    step_order: index + 1,
    step_description: `${step_title}: ${step_description}`,
  };

  if (!includeEditorial) return base;

  return {
    ...base,
    step_title,
    step_goal: step_description,
    how_to_use: step_description,
    input_needed,
    output_expected,
    why_this_tool,
    alternatives: [],
    is_required: true,
    step_kind,
    file_name,
    prompt,
  };
}

async function main() {
  console.log("Seeding editorial AI playbooks...");

  const [ecosystems, tools] = await Promise.all([
    fetchAllRows("ecosystems", "id, slug, name"),
    fetchAllRows("tools", "id, slug, name"),
  ]);

  const ecosystemBySlug = new Map((ecosystems || []).map((ecosystem) => [ecosystem.slug, ecosystem]));
  const toolBySlug = new Map((tools || []).map((tool) => [tool.slug, tool]));
  const neededSlugs = [...new Set(playbooks.flatMap((playbook) => playbook.steps.map((step) => step[0])))];
  const missingSlugs = neededSlugs.filter((slug) => !toolBySlug.has(slug));

  if (missingSlugs.length > 0) {
    throw new Error(`Missing tools for playbooks: ${missingSlugs.join(", ")}`);
  }

  const includePlaybookEditorial = await hasPlaybookEditorialColumns();
  const includeStepEditorial = await hasPlaybookToolEditorialColumns();

  // Fetch existing cover_urls keyed by slug so we don't overwrite them on upsert
  const existingSlugs = playbooks.map((p) => p.slug);
  const { data: existingPlaybooks } = await supabase
    .from("playbooks")
    .select("slug, cover_url")
    .in("slug", existingSlugs);
  const coverUrlBySlug = new Map(
    (existingPlaybooks || []).map((p) => [p.slug, p.cover_url ?? null])
  );

  const { data: upsertedPlaybooks, error: pbError } = await supabase
    .from("playbooks")
    .upsert(
      playbooks.map((playbook, index) =>
        playbookRow(playbook, ecosystemBySlug, includePlaybookEditorial, index, coverUrlBySlug.get(playbook.slug) ?? null)
      ),
      { onConflict: "slug" }
    )
    .select("id, slug, title");

  if (pbError) throw pbError;

  const playbookBySlug = new Map((upsertedPlaybooks || []).map((playbook) => [playbook.slug, playbook]));
  const playbookIds = (upsertedPlaybooks || []).map((playbook) => playbook.id);

  if (playbookIds.length > 0) {
    const { error: deleteError } = await supabase.from("playbook_tools").delete().in("playbook_id", playbookIds);
    if (deleteError) throw deleteError;
  }

  const stepRows = [];
  for (const playbook of playbooks) {
    const insertedPlaybook = playbookBySlug.get(playbook.slug);
    if (!insertedPlaybook) throw new Error(`Could not find inserted playbook ${playbook.slug}`);

    playbook.steps.forEach((step, index) => {
      const tool = toolBySlug.get(step[0]);
      stepRows.push(stepRow(insertedPlaybook.id, tool.id, step, index, includeStepEditorial));
    });
  }

  const { error: stepsError } = await supabase.from("playbook_tools").insert(stepRows);
  if (stepsError) throw stepsError;

  console.log(
    JSON.stringify(
      {
        playbooks_upserted: upsertedPlaybooks.length,
        playbook_steps_inserted: stepRows.length,
        rich_playbook_columns_detected: includePlaybookEditorial,
        rich_playbook_tool_columns_detected: includeStepEditorial,
      },
      null,
      2
    )
  );

  if (!includePlaybookEditorial || !includeStepEditorial) {
    console.log("Note: run lib/supabase/schema_update_v10_playbook_editorial_content.sql, then rerun this script to backfill richer playbook and step metadata.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
