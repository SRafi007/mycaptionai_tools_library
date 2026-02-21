/**
 * Seed Script: Upload tools.json → scraped_tools table (backup)
 *
 * Usage: npx tsx scripts/seedScrapedTools.ts
 *
 * This script:
 * 1. Creates the scraped_tools table if it doesn't exist
 * 2. Reads temp_data/tools.json
 * 3. Batch-inserts all rows into scraped_tools (chunks of 500)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS scraped_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  slug TEXT,
  short_description TEXT,
  official_url TEXT,
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
  scraped_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);
`;

interface ScrapedTool {
    name: string;
    slug: string;
    short_description: string;
    official_url: string;
    image_url: string;
    icon_url: string;
    pricing_label: string;
    categories: string[];
    upvotes: number;
    is_featured: boolean;
    rating_score: number;
    rating_count: number;
    application_category: string;
    publisher: string;
    category_rank: number;
    ranking_category: string;
    is_verified: boolean;
    scraped_at: string;
}

const BATCH_SIZE = 500;

async function main() {
    console.log("🚀 Starting scraped_tools seed...\n");

    // Step 1: Create table
    console.log("📦 Creating scraped_tools table (if not exists)...");
    const { error: createError } = await supabase.rpc("exec_sql", {
        query: CREATE_TABLE_SQL,
    });

    // If RPC doesn't exist, try raw SQL via REST
    if (createError) {
        console.log("⚠️  RPC exec_sql not available, attempting via SQL Editor approach...");
        console.log("   Please create the table manually using the SQL below, then re-run:");
        console.log("   Or the script will try to insert directly (table might already exist).\n");
    } else {
        console.log("✅ Table created/confirmed.\n");
    }

    // Step 2: Read JSON
    const jsonPath = path.resolve(__dirname, "..", "temp_data", "tools.json");
    if (!fs.existsSync(jsonPath)) {
        console.error(`❌ tools.json not found at: ${jsonPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const tools: ScrapedTool[] = JSON.parse(rawData);
    console.log(`📄 Loaded ${tools.length} tools from tools.json\n`);

    // Step 3: Check if data already exists
    const { count: existingCount } = await supabase
        .from("scraped_tools")
        .select("*", { count: "exact", head: true });

    if (existingCount && existingCount > 0) {
        console.log(`⚠️  scraped_tools already has ${existingCount} rows.`);
        console.log("   Skipping seed to avoid duplicates.");
        console.log("   If you want to re-seed, truncate the table first.\n");
        return;
    }

    // Step 4: Batch insert
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < tools.length; i += BATCH_SIZE) {
        const batch = tools.slice(i, i + BATCH_SIZE);

        const rows = batch.map((tool) => ({
            name: tool.name,
            slug: tool.slug,
            short_description: tool.short_description,
            official_url: tool.official_url,
            image_url: tool.image_url,
            icon_url: tool.icon_url,
            pricing_label: tool.pricing_label,
            categories: tool.categories, // JSONB
            upvotes: tool.upvotes,
            is_featured: tool.is_featured,
            rating_score: tool.rating_score,
            rating_count: tool.rating_count,
            application_category: tool.application_category,
            publisher: tool.publisher,
            category_rank: tool.category_rank,
            ranking_category: tool.ranking_category,
            is_verified: tool.is_verified,
            scraped_at: tool.scraped_at,
        }));

        const { error } = await supabase.from("scraped_tools").insert(rows);

        if (error) {
            console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
            failed += batch.length;
        } else {
            inserted += batch.length;
            const progress = ((i + batch.length) / tools.length * 100).toFixed(1);
            console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${inserted} inserted (${progress}%)`);
        }
    }

    console.log(`\n🏁 Seed complete!`);
    console.log(`   ✅ Inserted: ${inserted}`);
    if (failed > 0) console.log(`   ❌ Failed: ${failed}`);

    // Step 5: Verify count
    const { count: finalCount } = await supabase
        .from("scraped_tools")
        .select("*", { count: "exact", head: true });
    console.log(`   📊 Total rows in scraped_tools: ${finalCount}`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
