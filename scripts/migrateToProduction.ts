/**
 * Migration Script: scraped_tools -> production schema
 *
 * Usage: npx tsx scripts/migrateToProduction.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 500;

type PricingType = "Free" | "Freemium" | "Paid" | "Free-Trial" | "Contact";

interface ScrapedToolRow {
    id?: string;
    slug: string;
    name: string;
    short_description: string | null;
    long_description: string | null;
    official_url: string | null;
    canonical_url?: string | null;
    image_url: string | null;
    pricing_label: string | null;
    categories: string[] | null;
    upvotes: number | null;
    is_featured: boolean | null;
    scraped_at: string | null;
    source_name?: string | null;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function normalizeCategoryName(name: string): string {
    return name.replace(/\s+/g, " ").trim().toLowerCase();
}

function canonicalizeUrl(rawUrl: string | null | undefined): string | null {
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

function parsePricing(pricingLabel: string | null): {
    pricing_type: PricingType;
    pricing_label_raw: string | null;
    starting_price_text: string | null;
    currency_code: string | null;
} {
    if (!pricingLabel) {
        return {
            pricing_type: "Free",
            pricing_label_raw: null,
            starting_price_text: null,
            currency_code: null,
        };
    }

    const label = pricingLabel.trim();
    const lower = label.toLowerCase();

    let pricing_type: PricingType = "Free";
    if (lower.includes("contact")) pricing_type = "Contact";
    else if (lower.includes("trial")) pricing_type = "Free-Trial";
    else if (lower.includes("freemium")) pricing_type = "Freemium";
    else if (lower.includes("paid")) pricing_type = "Paid";
    else if (lower.includes("free")) pricing_type = "Free";

    const priceMatch = label.match(/([$€£]\s?\d+(?:[.,]\d+)?(?:\s*\/\s*[a-zA-Z]+)?)/);
    const starting_price_text = priceMatch ? priceMatch[1].replace(/\s+/g, "") : null;

    let currency_code: string | null = null;
    if (starting_price_text?.includes("$")) currency_code = "USD";
    if (starting_price_text?.includes("€")) currency_code = "EUR";
    if (starting_price_text?.includes("£")) currency_code = "GBP";

    return {
        pricing_type,
        pricing_label_raw: label,
        starting_price_text,
        currency_code,
    };
}

function isNoisyDescription(value: string | null | undefined): boolean {
    if (!value) return false;
    const text = value.trim();
    const urlCount = (text.match(/https?:\/\//gi) || []).length;
    const hashtagCount = (text.match(/#[a-z0-9_]+/gi) || []).length;
    const lines = text.split(/\r?\n/).length;

    if (text.length > 2000) return true;
    if (urlCount >= 5) return true;
    if (hashtagCount >= 5) return true;
    if (lines >= 30) return true;

    return false;
}

function computeQualityScore(tool: ScrapedToolRow): number {
    let score = 100;

    if (!tool.short_description || tool.short_description.trim().length < 20) score -= 15;
    if (!tool.official_url) score -= 20;
    if (!tool.image_url) score -= 10;
    if (!tool.categories || tool.categories.length === 0) score -= 20;
    if (isNoisyDescription(tool.long_description)) score -= 20;

    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return score;
}

async function fetchAllScrapedTools() {
    const all: ScrapedToolRow[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from("scraped_tools")
            .select("*")
            .range(from, from + pageSize - 1);

        if (error) {
            console.error(`Error fetching scraped_tools: ${error.message}`);
            break;
        }
        if (!data || data.length === 0) break;

        all.push(...(data as ScrapedToolRow[]));
        from += pageSize;
        if (data.length < pageSize) break;
    }

    return all;
}

async function main() {
    console.log("Starting migration: scraped_tools -> production schema");

    const scrapedTools = await fetchAllScrapedTools();
    console.log(`Found ${scrapedTools.length} scraped tools`);

    if (scrapedTools.length === 0) {
        console.error("No scraped tools found. Run seedScrapedTools.ts first.");
        process.exit(1);
    }

    const categorySet = new Set<string>();
    for (const tool of scrapedTools) {
        if (!tool.categories || !Array.isArray(tool.categories)) continue;
        for (const rawCat of tool.categories) {
            const normalized = normalizeCategoryName(rawCat || "");
            if (normalized) categorySet.add(normalized);
        }
    }

    const uniqueCategories = Array.from(categorySet).sort();
    console.log(`Found ${uniqueCategories.length} unique categories`);

    const categoryMap = new Map<string, string>();
    for (let i = 0; i < uniqueCategories.length; i += BATCH_SIZE) {
        const batch = uniqueCategories.slice(i, i + BATCH_SIZE).map((name) => ({
            name,
            slug: slugify(name),
            description: `AI tools for ${name}`,
            seo_title: `Best ${name} AI Tools`,
            seo_description: `Discover the best AI tools for ${name}. Compare features and pricing.`,
        }));

        const { data, error } = await supabase
            .from("categories")
            .upsert(batch, { onConflict: "slug" })
            .select("id,name");

        if (error) {
            console.error(`Category batch failed: ${error.message}`);
        } else {
            (data || []).forEach((cat: any) => categoryMap.set(cat.name, cat.id));
        }
    }

    const { data: allCats } = await supabase.from("categories").select("id,name");
    (allCats || []).forEach((cat: any) => categoryMap.set(cat.name, cat.id));
    console.log(`Category map size: ${categoryMap.size}`);

    let toolsInserted = 0;
    let toolsFailed = 0;
    const toolIdMap = new Map<string, string>();

    for (let i = 0; i < scrapedTools.length; i += BATCH_SIZE) {
        const batch = scrapedTools.slice(i, i + BATCH_SIZE);
        const rows = batch.map((st) => {
            const pricing = parsePricing(st.pricing_label);
            const noisy = isNoisyDescription(st.long_description);
            const canonical = st.canonical_url || canonicalizeUrl(st.official_url);

            return {
                name: st.name,
                slug: st.slug,
                short_description: st.short_description,
                long_description: st.long_description,
                url: st.official_url || canonical || "https://example.com",
                canonical_url: canonical,
                affiliate_url: st.official_url,
                image_url: st.image_url,
                icon_url: null,
                pricing_type: pricing.pricing_type,
                pricing_label_raw: pricing.pricing_label_raw,
                starting_price_text: pricing.starting_price_text,
                currency_code: pricing.currency_code,
                is_verified: false,
                is_featured: st.is_featured || false,
                upvotes: st.upvotes || 0,
                rating_score: 0,
                rating_count: 0,
                publisher: null,
                source: st.source_name || "futurepedia",
                source_scraped_at: st.scraped_at,
                last_seen_at: st.scraped_at,
                is_description_noisy: noisy,
                quality_score: computeQualityScore(st),
            };
        });

        const { data, error } = await supabase
            .from("tools")
            .upsert(rows, { onConflict: "slug" })
            .select("id,slug");

        if (error) {
            toolsFailed += batch.length;
            console.error(`Tool batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
        } else {
            toolsInserted += (data || []).length;
            (data || []).forEach((t: any) => toolIdMap.set(t.slug, t.id));
        }
    }

    console.log(`Tools upserted: ${toolsInserted}. Failed: ${toolsFailed}`);

    if (toolIdMap.size < toolsInserted) {
        const allTools: any[] = [];
        let from = 0;
        while (true) {
            const { data } = await supabase
                .from("tools")
                .select("id,slug")
                .range(from, from + 999);
            if (!data || data.length === 0) break;
            allTools.push(...data);
            from += 1000;
            if (data.length < 1000) break;
        }
        allTools.forEach((t) => toolIdMap.set(t.slug, t.id));
    }

    const allRelations: Array<{ tool_id: string; category_id: string }> = [];

    for (const st of scrapedTools) {
        const toolId = toolIdMap.get(st.slug);
        if (!toolId || !st.categories || !Array.isArray(st.categories)) continue;

        for (const rawCat of st.categories) {
            const normalized = normalizeCategoryName(rawCat || "");
            if (!normalized) continue;

            const categoryId = categoryMap.get(normalized);
            if (categoryId) allRelations.push({ tool_id: toolId, category_id: categoryId });
        }
    }

    let relationsInserted = 0;
    let relationsFailed = 0;

    for (let i = 0; i < allRelations.length; i += BATCH_SIZE) {
        const batch = allRelations.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
            .from("tool_categories")
            .upsert(batch, { onConflict: "tool_id,category_id" });

        if (error) {
            relationsFailed += batch.length;
            console.error(`Relation batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
        } else {
            relationsInserted += batch.length;
        }
    }

    for (const [catName, catId] of categoryMap) {
        const count = allRelations.filter((r) => r.category_id === catId).length;
        const { error } = await supabase
            .from("categories")
            .update({ tool_count: count })
            .eq("id", catId);

        if (error) {
            console.error(`Failed to update tool_count for ${catName}: ${error.message}`);
        }
    }

    console.log("Migration complete");
    console.log(`Categories: ${categoryMap.size}`);
    console.log(`Tools: ${toolsInserted}`);
    console.log(`Tool-Category relations: ${relationsInserted}`);
    if (toolsFailed > 0) console.log(`Tools failed: ${toolsFailed}`);
    if (relationsFailed > 0) console.log(`Relations failed: ${relationsFailed}`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
