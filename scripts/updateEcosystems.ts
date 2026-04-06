import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Upserting the latest 2026 Ecosystem AI Models...");
  const ecosystems = [
    {
      name: 'OpenAI',
      slug: 'openai',
      description: 'The massive ecosystem built around the GPT-5.x series (including GPT-5.4 Pro and Thinking models). Discover the top UI clients, prompt tools, and integration frameworks.',
      icon_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
    },
    {
      name: 'Anthropic (Claude)',
      slug: 'anthropic',
      description: 'The ecosystem built around the Claude 4.6 and 5 families (Opus 4.6, Sonnet 5 Fennec). Recognized as the leading choice for heavy coding, intricate writing, and agentic collaborative stacks.',
      icon_url: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Anthropic_logo.svg'
    },
    {
      name: 'Google Gemini',
      slug: 'google-gemini',
      description: 'The ecosystem built around Gemini 3 Pro and Gemini 3.1 Flash. Leverage massive context windows, Deep Think capabilities, and deep Google Workspace integrations.',
      icon_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg'
    },
    {
      name: 'Open Source (Llama / Mistral)',
      slug: 'open-source',
      description: 'The local and open-weights ecosystem powered by Meta\'s Llama, Mistral, and others. Discover the best local runners and privacy-focused wrappers.',
      icon_url: 'https://cdn.iconscout.com/icon/free/png-256/free-open-source-icon-download-in-svg-png-gif-file-formats--coding-programming-web-development-pack-logos-icons-2260786.png?f=webp&w=256'
    }
  ];

  for (const eco of ecosystems) {
    const { error } = await supabase.from('ecosystems').upsert(eco, { onConflict: 'slug' });
    if (error) {
      console.error(`Error upserting ${eco.slug}:`, error);
    } else {
      console.log(`Successfully updated ${eco.name}`);
    }
  }
}

run();
