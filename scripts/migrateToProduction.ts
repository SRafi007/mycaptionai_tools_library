/**
 * Migration Script: scraped_tools → production schema
 *
 * Usage: npx tsx scripts/migrateToProduction.ts
 *
 * Prerequisites:
 *   1. Run the SQL in lib/supabase/schema.sql via Supabase Dashboard
 *   2. Run npx tsx scripts/seedScrapedTools.ts (to populate scraped_tools)
 *
 * This script:
 *   1. Reads all rows from scraped_tools
 *   2. Extracts unique categories → inserts into categories table
 *   3. Maps each tool into the production tools table
 *   4. Creates tool_categories relationships
 */

import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing env vars");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 500;

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/**
 * Map scraped pricing_label → our pricing_enum
 */
function mapPricing(label: string | null): string {
    if (!label) return "Free";
    const mapping: Record<string, string> = {
        Free: "Free",
        Freemium: "Freemium",
        Paid: "Paid",
        "Free-Trial": "Free-Trial",
        Contact: "Contact",
        // edge cases
        Trial: "Free-Trial",
    };
    return mapping[label] || "Free";
}

async function fetchAllScrapedTools() {
    const all: any[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from("scraped_tools")
            .select("*")
            .range(from, from + pageSize - 1);

        if (error) {
            console.error("❌ Error fetching scraped_tools:", error.message);
            break;
        }
        if (!data || data.length === 0) break;

        all.push(...data);
        from += pageSize;

        if (data.length < pageSize) break;
    }

    return all;
}

async function main() {
    console.log("🚀 Starting migration: scraped_tools → production schema\n");

    // Step 1: Fetch all scraped tools
    console.log("📥 Fetching all scraped_tools...");
    const scrapedTools = await fetchAllScrapedTools();
    console.log(`   Found ${scrapedTools.length} tools\n`);

    if (scrapedTools.length === 0) {
        console.error("❌ No scraped tools found. Run seedScrapedTools.ts first.");
        process.exit(1);
    }

    // Step 2: Extract unique categories
    console.log("📂 Extracting unique categories...");
    const categorySet = new Set<string>();
    for (const tool of scrapedTools) {
        const cats = tool.categories as string[] | null;
        if (cats && Array.isArray(cats)) {
            cats.forEach((c: string) => categorySet.add(c.trim()));
        }
    }
    const uniqueCategories = Array.from(categorySet).sort();
    console.log(`   Found ${uniqueCategories.length} unique categories\n`);

    // Step 3: Insert categories
    console.log("📦 Inserting categories...");
    const categoryMap = new Map<string, string>(); // name → UUID

    for (let i = 0; i < uniqueCategories.length; i += BATCH_SIZE) {
        const batch = uniqueCategories.slice(i, i + BATCH_SIZE).map((name) => ({
            name,
            slug: slugify(name),
            description: `AI tools for ${name}`,
            seo_title: `Best ${name} AI Tools`,
            seo_description: `Discover the best AI tools for ${name}. Compare features, pricing, and ratings.`,
        }));

        const { data, error } = await supabase
            .from("categories")
            .upsert(batch, { onConflict: "name" })
            .select("id, name");

        if (error) {
            console.error(`   ❌ Category batch failed:`, error.message);
        } else if (data) {
            data.forEach((cat: any) => categoryMap.set(cat.name, cat.id));
            console.log(`   ✅ ${data.length} categories inserted/updated`);
        }
    }

    // Fetch all categories to ensure we have full map
    const { data: allCats } = await supabase.from("categories").select("id, name");
    if (allCats) {
        allCats.forEach((cat: any) => categoryMap.set(cat.name, cat.id));
    }
    console.log(`   📊 Category map has ${categoryMap.size} entries\n`);

    // Step 4: Insert tools
    console.log("🔧 Migrating tools...");
    let toolsInserted = 0;
    let toolsFailed = 0;

    // Track slug → tool_id for category mapping
    const toolIdMap = new Map<string, string>();

    for (let i = 0; i < scrapedTools.length; i += BATCH_SIZE) {
        const batch = scrapedTools.slice(i, i + BATCH_SIZE);

        const rows = batch.map((st: any) => ({
            name: st.name,
            slug: st.slug,
            short_description: st.short_description,
            url: st.official_url || "https://unknown.com",
            affiliate_url: st.official_url,
            image_url: st.image_url,
            icon_url: st.icon_url,
            pricing_type: mapPricing(st.pricing_label),
            is_verified: st.is_verified || false,
            is_featured: st.is_featured || false,
            upvotes: st.upvotes || 0,
            rating_score: st.rating_score || 0,
            rating_count: st.rating_count || 0,
            publisher: st.publisher,
            source: "aixploria",
            source_scraped_at: st.scraped_at,
        }));

        const { data, error } = await supabase
            .from("tools")
            .upsert(rows, { onConflict: "slug" })
            .select("id, slug");

        if (error) {
            console.error(
                `   ❌ Tool batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
                error.message
            );
            toolsFailed += batch.length;
        } else if (data) {
            data.forEach((t: any) => toolIdMap.set(t.slug, t.id));
            toolsInserted += data.length;
            const progress = (((i + batch.length) / scrapedTools.length) * 100).toFixed(1);
            console.log(
                `   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${toolsInserted} tools (${progress}%)`
            );
        }
    }

    console.log(`\n   📊 Tools inserted: ${toolsInserted}, failed: ${toolsFailed}\n`);

    // If we don't have IDs from upsert, fetch them
    if (toolIdMap.size < toolsInserted) {
        console.log("   📥 Fetching tool IDs...");
        const allTools = [];
        let from = 0;
        while (true) {
            const { data } = await supabase
                .from("tools")
                .select("id, slug")
                .range(from, from + 999);
            if (!data || data.length === 0) break;
            allTools.push(...data);
            from += 1000;
            if (data.length < 1000) break;
        }
        allTools.forEach((t: any) => toolIdMap.set(t.slug, t.id));
        console.log(`   📊 Tool ID map has ${toolIdMap.size} entries\n`);
    }

    // Step 5: Create tool_categories relationships
    console.log("🔗 Creating tool_categories relationships...");
    let relationsInserted = 0;
    let relationsFailed = 0;

    const allRelations: Array<{ tool_id: string; category_id: string }> = [];

    for (const st of scrapedTools) {
        const toolId = toolIdMap.get(st.slug);
        if (!toolId) continue;

        const cats = st.categories as string[] | null;
        if (!cats || !Array.isArray(cats)) continue;

        for (const catName of cats) {
            const categoryId = categoryMap.get(catName.trim());
            if (categoryId) {
                allRelations.push({ tool_id: toolId, category_id: categoryId });
            }
        }
    }

    console.log(`   📊 Total relations to insert: ${allRelations.length}`);

    for (let i = 0; i < allRelations.length; i += BATCH_SIZE) {
        const batch = allRelations.slice(i, i + BATCH_SIZE);

        const { error } = await supabase
            .from("tool_categories")
            .upsert(batch, { onConflict: "tool_id,category_id" });

        if (error) {
            console.error(
                `   ❌ Relation batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
                error.message
            );
            relationsFailed += batch.length;
        } else {
            relationsInserted += batch.length;
            const progress = (
                ((i + batch.length) / allRelations.length) *
                100
            ).toFixed(1);
            console.log(
                `   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${relationsInserted} relations (${progress}%)`
            );
        }
    }

    // Step 6: Update category tool_count
    console.log("\n📊 Updating category tool counts...");
    for (const [catName, catId] of categoryMap) {
        const count = allRelations.filter((r) => r.category_id === catId).length;
        const { error } = await supabase
            .from("categories")
            .update({ tool_count: count })
            .eq("id", catId);

        if (error) {
            console.error(`   ⚠️ Failed to update count for ${catName}: ${error.message}`);
        }
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("🏁 Migration complete!");
    console.log(`   📊 Categories: ${categoryMap.size}`);
    console.log(`   📊 Tools: ${toolsInserted}`);
    console.log(`   📊 Tool-Category relations: ${relationsInserted}`);
    if (toolsFailed > 0) console.log(`   ❌ Tools failed: ${toolsFailed}`);
    if (relationsFailed > 0) console.log(`   ❌ Relations failed: ${relationsFailed}`);
    console.log("=".repeat(60));
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
