/**
 * exportPlaybooks.mjs
 * 
 * READ-ONLY export of the current `playbooks` table from Supabase.
 * Writes a JSON snapshot to scripts/playbooks-snapshot.json including
 * id, slug, title, cover_url and all other columns — nothing is pushed to the DB.
 * 
 * Usage:
 *   node scripts/exportPlaybooks.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching current playbooks from Supabase (read-only)...\n");

  const { data: playbooks, error } = await supabase
    .from("playbooks")
    .select("id, slug, title, description, cover_url, is_published, visual_position, created_at, updated_at")
    .order("visual_position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching playbooks:", error);
    process.exit(1);
  }

  const outPath = path.resolve(process.cwd(), "scripts/playbooks-snapshot.json");
  fs.writeFileSync(outPath, JSON.stringify(playbooks, null, 2), "utf-8");

  console.log(`✅ Exported ${playbooks.length} playbooks → scripts/playbooks-snapshot.json\n`);

  // Print a summary table to the console
  const maxTitleLen = Math.max(...playbooks.map((p) => p.title?.length ?? 0), 5);
  console.log(
    "id".padEnd(38) +
    "slug".padEnd(60) +
    "cover_url".padEnd(10)
  );
  console.log("-".repeat(110));
  for (const p of playbooks) {
    console.log(
      (p.id ?? "").padEnd(38) +
      (p.slug ?? "").padEnd(60) +
      (p.cover_url ? "✅ set" : "❌ null")
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
