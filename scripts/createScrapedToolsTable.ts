/**
 * Creates the scraped_tools table via Supabase REST API (SQL endpoint).
 * Usage: npx tsx scripts/createScrapedToolsTable.ts
 */

import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Enable RLS but allow service_role full access
ALTER TABLE scraped_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Service role full access on scraped_tools"
  ON scraped_tools FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
`;

async function main() {
    console.log("🔧 Creating scraped_tools table via Supabase SQL...\n");

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ query: SQL }),
    });

    // If RPC doesn't work, use the raw SQL endpoint
    if (!response.ok) {
        console.log("⚠️  RPC approach failed, trying direct SQL endpoint...");

        const sqlResponse = await fetch(`${SUPABASE_URL}/pg`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            body: JSON.stringify({ query: SQL }),
        });

        if (!sqlResponse.ok) {
            console.log("\n⚠️  Cannot auto-create table via API.");
            console.log("📋 Please run this SQL in Supabase Dashboard → SQL Editor:\n");
            console.log(SQL);
            console.log("\n   Then re-run: npx tsx scripts/seedScrapedTools.ts");
            return;
        }
    }

    console.log("✅ scraped_tools table created successfully!");
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
