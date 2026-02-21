/**
 * Seed Script: Upload tempdata/tools.json -> scraped_tools table
 *
 * Usage: npx tsx scripts/seedScrapedTools.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS scraped_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  slug TEXT,
  short_description TEXT,
  long_description TEXT,
  official_url TEXT,
  canonical_url TEXT,
  image_url TEXT,
  icon_url TEXT,
  pricing_label TEXT,
  categories JSONB,
  upvotes INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  rating_score FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  application_category TEXT,
  publisher TEXT,
  category_rank INT,
  ranking_category TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  source_name TEXT DEFAULT 'futurepedia',
  source_raw JSONB DEFAULT '{}'::jsonb,
  ingestion_batch_id TEXT,
  scraped_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);
`;

interface ScrapedTool {
    slug: string;
    name: string;
    short_description: string;
    long_description: string;
    official_url: string;
    image_url: string;
    pricing_label: string;
    categories: string[];
    upvotes: number;
    is_featured: boolean;
    scraped_at: string;
}

const BATCH_SIZE = 500;
const SOURCE_NAME = "futurepedia";

function cleanUrl(rawUrl: string | null | undefined): string | null {
    if (!rawUrl) return null;
    try {
        const url = new URL(rawUrl);
        const blocked = new Set([
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "fbclid",
            "gclid",
            "ref",
            "via",
        ]);
        Array.from(url.searchParams.keys()).forEach((key) => {
            if (blocked.has(key.toLowerCase())) {
                url.searchParams.delete(key);
            }
        });
        return url.toString();
    } catch {
        return rawUrl;
    }
}

async function main() {
    console.log("Starting scraped_tools seed...");

    const batchId = crypto.randomUUID();

    const { error: createError } = await supabase.rpc("exec_sql", {
        query: CREATE_TABLE_SQL,
    });

    if (createError) {
        console.log("RPC exec_sql unavailable. Continuing (table may already exist).");
    } else {
        console.log("scraped_tools table created/confirmed.");
    }

    const preferredPath = path.resolve(__dirname, "..", "tempdata", "tools.json");
    const legacyPath = path.resolve(__dirname, "..", "temp_data", "tools.json");
    const jsonPath = fs.existsSync(preferredPath) ? preferredPath : legacyPath;

    if (!fs.existsSync(jsonPath)) {
        console.error(`tools.json not found. Checked:\n- ${preferredPath}\n- ${legacyPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const tools = JSON.parse(rawData) as ScrapedTool[];

    if (!Array.isArray(tools) || tools.length === 0) {
        console.error("tools.json is empty or invalid.");
        process.exit(1);
    }

    console.log(`Loaded ${tools.length} tools from ${jsonPath}`);

    const { count: existingCount } = await supabase
        .from("scraped_tools")
        .select("*", { count: "exact", head: true });

    if ((existingCount || 0) > 0) {
        console.log(`scraped_tools already has ${existingCount} rows. Skipping seed.`);
        console.log("Truncate the table first if you want a fresh import.");
        return;
    }

    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < tools.length; i += BATCH_SIZE) {
        const batch = tools.slice(i, i + BATCH_SIZE);

        const rows = batch.map((tool) => ({
            name: tool.name,
            slug: tool.slug,
            short_description: tool.short_description,
            long_description: tool.long_description,
            official_url: tool.official_url,
            canonical_url: cleanUrl(tool.official_url),
            image_url: tool.image_url,
            icon_url: null,
            pricing_label: tool.pricing_label,
            categories: tool.categories || [],
            upvotes: tool.upvotes || 0,
            is_featured: tool.is_featured || false,
            rating_score: 0,
            rating_count: 0,
            application_category: null,
            publisher: null,
            category_rank: null,
            ranking_category: null,
            is_verified: false,
            source_name: SOURCE_NAME,
            source_raw: tool,
            ingestion_batch_id: batchId,
            scraped_at: tool.scraped_at,
            ingested_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from("scraped_tools").insert(rows);

        if (error) {
            failed += batch.length;
            console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
        } else {
            inserted += batch.length;
            const progress = (((i + batch.length) / tools.length) * 100).toFixed(1);
            console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} inserted (${progress}%)`);
        }
    }

    const { count: finalCount } = await supabase
        .from("scraped_tools")
        .select("*", { count: "exact", head: true });

    console.log("Seed complete.");
    console.log(`Inserted: ${inserted}`);
    if (failed > 0) console.log(`Failed: ${failed}`);
    console.log(`Total rows in scraped_tools: ${finalCount || 0}`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
