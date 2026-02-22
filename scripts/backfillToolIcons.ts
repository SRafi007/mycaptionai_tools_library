/**
 * Backfill icon_url in tools table from temp/tools.json by slug.
 *
 * Safety:
 * - Dry-run by default (no DB writes)
 * - Exact slug matching only
 * - Updates only icon_url column
 * - By default, only fills missing/empty icon_url values
 *
 * Usage:
 *   npx tsx scripts/backfillToolIcons.ts
 *   npx tsx scripts/backfillToolIcons.ts --apply
 *   npx tsx scripts/backfillToolIcons.ts --apply --overwrite-existing
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const JSON_PATH = path.resolve(__dirname, "..", "temp", "tools.json");
const CHUNK_SIZE = 500;
const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const overwriteExisting = args.has("--overwrite-existing");

interface JsonTool {
    slug: string;
    icon_url?: string | null;
}

interface ToolRow {
    id: string;
    slug: string;
    icon_url: string | null;
}

function normalize(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size));
    }
    return out;
}

async function fetchToolsBySlugs(slugs: string[]): Promise<ToolRow[]> {
    const all: ToolRow[] = [];
    const groups = chunk(slugs, CHUNK_SIZE);

    for (const group of groups) {
        const { data, error } = await supabase
            .from("tools")
            .select("id,slug,icon_url")
            .in("slug", group);

        if (error) {
            throw new Error(`Failed fetching tools by slug: ${error.message}`);
        }
        if (data?.length) all.push(...(data as ToolRow[]));
    }

    return all;
}

async function main() {
    if (!fs.existsSync(JSON_PATH)) {
        console.error(`Input file not found: ${JSON_PATH}`);
        process.exit(1);
    }

    const parsed = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8")) as JsonTool[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
        console.error("temp/tools.json is empty or invalid.");
        process.exit(1);
    }

    const slugToIcon = new Map<string, string>();
    const duplicateSlugConflicts: string[] = [];
    let invalidRows = 0;

    for (const row of parsed) {
        const slug = normalize(row?.slug);
        const icon = normalize(row?.icon_url);
        if (!slug) {
            invalidRows += 1;
            continue;
        }
        if (!icon) continue;

        const existing = slugToIcon.get(slug);
        if (existing && existing !== icon) {
            duplicateSlugConflicts.push(slug);
            continue;
        }
        slugToIcon.set(slug, icon);
    }

    if (duplicateSlugConflicts.length > 0) {
        console.error("Duplicate slug(s) with different icon_url found in temp/tools.json:");
        for (const slug of [...new Set(duplicateSlugConflicts)].slice(0, 20)) {
            console.error(`- ${slug}`);
        }
        console.error("Resolve conflicts first, then rerun.");
        process.exit(1);
    }

    const slugs = Array.from(slugToIcon.keys());
    if (slugs.length === 0) {
        console.error("No valid slug + icon_url pairs found in temp/tools.json.");
        process.exit(1);
    }

    console.log(`Loaded ${parsed.length} JSON rows.`);
    console.log(`Valid slug + icon_url pairs: ${slugs.length}`);
    if (invalidRows > 0) console.log(`Skipped invalid rows (missing slug): ${invalidRows}`);

    const dbRows = await fetchToolsBySlugs(slugs);
    const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]));

    const missingInDb = slugs.filter((slug) => !dbBySlug.has(slug));
    const updates: Array<{ id: string; slug: string; icon_url: string }> = [];
    let skippedExisting = 0;
    let unchanged = 0;

    for (const slug of slugs) {
        const row = dbBySlug.get(slug);
        if (!row) continue;

        const incomingIcon = slugToIcon.get(slug)!;
        const currentIcon = normalize(row.icon_url);

        if (currentIcon === incomingIcon) {
            unchanged += 1;
            continue;
        }

        if (!overwriteExisting && currentIcon) {
            skippedExisting += 1;
            continue;
        }

        updates.push({ id: row.id, slug, icon_url: incomingIcon });
    }

    console.log("");
    console.log("Backfill plan:");
    console.log(`- Matched tools in DB: ${dbRows.length}`);
    console.log(`- Missing slugs in DB: ${missingInDb.length}`);
    console.log(`- Unchanged icon_url: ${unchanged}`);
    console.log(`- Skipped (existing icon_url): ${skippedExisting}`);
    console.log(`- Pending updates: ${updates.length}`);
    console.log(`- Mode: ${shouldApply ? "APPLY" : "DRY-RUN"}`);

    if (missingInDb.length > 0) {
        console.log("");
        console.log("Sample missing slugs:");
        for (const slug of missingInDb.slice(0, 20)) console.log(`- ${slug}`);
        if (missingInDb.length > 20) console.log(`...and ${missingInDb.length - 20} more`);
    }

    if (!shouldApply) {
        console.log("");
        console.log("Dry-run only. Re-run with --apply to execute updates.");
        return;
    }

    let success = 0;
    let failed = 0;

    for (const group of chunk(updates, CHUNK_SIZE)) {
        for (const item of group) {
            const { error } = await supabase
                .from("tools")
                .update({ icon_url: item.icon_url })
                .eq("id", item.id);

            if (error) {
                failed += 1;
                console.error(`Failed: ${item.slug} -> ${error.message}`);
            } else {
                success += 1;
            }
        }
        console.log(`Progress: ${success + failed}/${updates.length}`);
    }

    console.log("");
    console.log("Backfill completed:");
    console.log(`- Updated: ${success}`);
    console.log(`- Failed: ${failed}`);
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

