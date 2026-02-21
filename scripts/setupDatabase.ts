/**
 * Creates tables via Supabase pg-meta API
 * Usage: npx tsx scripts/setupDatabase.ts
 */
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Supabase exposes a pg-meta API for SQL queries at /pg/query
const SQL_ENDPOINT = `${SUPABASE_URL}/pg/query`;

async function runSQL(sql: string, label: string): Promise<boolean> {
    console.log(`\n⏳ ${label}...`);

    // Try multiple endpoints
    const endpoints = [
        `${SUPABASE_URL}/pg/query`,
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    ];

    for (const endpoint of endpoints) {
        try {
            const body =
                endpoint.includes("rpc")
                    ? JSON.stringify({ query: sql })
                    : JSON.stringify({ query: sql });

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "X-Connection-Encrypted": "true",
                },
                body,
            });

            if (response.ok) {
                console.log(`✅ ${label} — success via ${endpoint}`);
                return true;
            }

            const text = await response.text();
            console.log(`   ⚠️ ${endpoint} returned ${response.status}: ${text.slice(0, 200)}`);
        } catch (err: any) {
            console.log(`   ⚠️ ${endpoint} error: ${err.message}`);
        }
    }

    return false;
}

async function main() {
    console.log("🔧 Setting up database tables...\n");

    const createScrapedTools = `
CREATE TABLE IF NOT EXISTS scraped_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

    const success = await runSQL(createScrapedTools, "Create scraped_tools table");

    if (!success) {
        console.log("\n" + "=".repeat(70));
        console.log("❌ Could not auto-create tables via API.");
        console.log("📋 Please run this SQL in Supabase Dashboard → SQL Editor:");
        console.log("   URL: https://supabase.com/dashboard/project/slsmeyuvhrqljpdjbvrm/sql/new");
        console.log("=".repeat(70));
        console.log(createScrapedTools);
        console.log(`
ALTER TABLE scraped_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on scraped_tools"
  ON scraped_tools FOR ALL
  USING (true)
  WITH CHECK (true);
`);
        console.log("=".repeat(70));
        console.log("\nAfter running the SQL, execute: npx tsx scripts/seedScrapedTools.ts\n");
    }
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
