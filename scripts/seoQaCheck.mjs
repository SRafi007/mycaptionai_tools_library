#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://mycaptionai.com";
const DEFAULT_SAMPLE_SIZE = 3;
const DEFAULT_TIMEOUT_MS = 15000;

const EXPECTED_CHILD_SITEMAPS = [
    "/sitemaps/tools.xml",
    "/sitemaps/categories.xml",
    "/sitemaps/blog.xml",
    "/sitemaps/use-cases.xml",
    "/sitemaps/ecosystems.xml",
    "/sitemaps/playbooks.xml",
    "/sitemaps/prompts.xml",
];

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith("--")) continue;

        const key = token.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
            args[key] = "true";
            continue;
        }
        args[key] = next;
        i += 1;
    }
    return args;
}

function parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
}

function normalizeBaseUrl(input) {
    const raw = (input || "").trim() || DEFAULT_BASE_URL;
    const url = new URL(raw);
    url.hash = "";
    if (url.pathname !== "/") {
        url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString().replace(/\/$/, "");
}

function normalizePathAndQuery(input, base = "https://example.com") {
    const url = new URL(input, base);
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
        url.pathname = url.pathname.slice(0, -1);
    }

    const entries = Array.from(url.searchParams.entries());
    entries.sort(([keyA, valueA], [keyB, valueB]) => {
        const keySort = keyA.localeCompare(keyB);
        if (keySort !== 0) return keySort;
        return valueA.localeCompare(valueB);
    });

    const sorted = new URLSearchParams();
    for (const [key, value] of entries) sorted.append(key, value);
    return `${url.pathname}${sorted.toString() ? `?${sorted.toString()}` : ""}`;
}

function decodeXml(value) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'");
}

function extractLocs(xml) {
    const locs = [];
    const regex = /<loc>([\s\S]*?)<\/loc>/gi;
    let match = regex.exec(xml);
    while (match) {
        locs.push(decodeXml(match[1].trim()));
        match = regex.exec(xml);
    }
    return locs;
}

function getAttribute(tag, attributeName) {
    const regex = new RegExp(`${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
    const match = tag.match(regex);
    if (!match) return null;
    return match[1] || match[2] || match[3] || null;
}

function extractCanonicalHref(html) {
    const linkRegex = /<link\b[^>]*>/gi;
    let match = linkRegex.exec(html);
    while (match) {
        const tag = match[0];
        const rel = (getAttribute(tag, "rel") || "").toLowerCase();
        if (rel.split(/\s+/).includes("canonical")) {
            return getAttribute(tag, "href");
        }
        match = linkRegex.exec(html);
    }
    return null;
}

function extractRobotsMeta(html) {
    const metaRegex = /<meta\b[^>]*>/gi;
    let robots = null;
    let googlebot = null;

    let match = metaRegex.exec(html);
    while (match) {
        const tag = match[0];
        const name = (getAttribute(tag, "name") || "").toLowerCase();
        const content = getAttribute(tag, "content");
        if (!content) {
            match = metaRegex.exec(html);
            continue;
        }

        if (name === "robots") robots = content;
        if (name === "googlebot") googlebot = content;
        match = metaRegex.exec(html);
    }

    return robots || googlebot;
}

function normalizeUrlForCompare(input) {
    const url = new URL(input);
    url.hash = "";

    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
        url.pathname = url.pathname.slice(0, -1);
    }

    const entries = Array.from(url.searchParams.entries());
    entries.sort(([keyA, valueA], [keyB, valueB]) => {
        const keySort = keyA.localeCompare(keyB);
        if (keySort !== 0) return keySort;
        return valueA.localeCompare(valueB);
    });
    const sorted = new URLSearchParams();
    for (const [key, value] of entries) sorted.append(key, value);
    url.search = sorted.toString() ? `?${sorted.toString()}` : "";

    return url.toString();
}

function hasNoindexDirective(content) {
    if (!content) return false;
    const directives = content
        .split(",")
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);
    return directives.includes("noindex");
}

function extractRobotsSitemaps(robotsText) {
    const sitemaps = [];
    const regex = /^sitemap:\s*(.+)$/gim;
    let match = regex.exec(robotsText);
    while (match) {
        sitemaps.push(match[1].trim());
        match = regex.exec(robotsText);
    }
    return sitemaps;
}

async function fetchText(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            redirect: "follow",
            signal: controller.signal,
            headers: {
                "user-agent": "mycaptionai-seo-qa/1.0",
                "accept-language": "en-US,en;q=0.9",
            },
        });

        const body = await response.text();
        return { response, body };
    } finally {
        clearTimeout(timeoutId);
    }
}

function assertCondition(state, condition, message) {
    if (condition) {
        state.passes.push(message);
    } else {
        state.failures.push(message);
    }
}

function remapToBaseOrigin(urlToRemap, baseUrl) {
    const source = new URL(urlToRemap);
    const targetBase = new URL(baseUrl);
    return `${targetBase.origin}${source.pathname}${source.search}`;
}

async function collectPageSeo(url, timeoutMs) {
    const { response, body } = await fetchText(url, timeoutMs);
    const canonicalHref = extractCanonicalHref(body);
    const canonical = canonicalHref ? new URL(canonicalHref, url).toString() : null;
    const robotsMeta = extractRobotsMeta(body);
    const robotsHeader = response.headers.get("x-robots-tag");
    const noindex = hasNoindexDirective(robotsMeta) || hasNoindexDirective(robotsHeader);

    return {
        status: response.status,
        canonical,
        robotsMeta,
        robotsHeader,
        noindex,
    };
}

function sampleUrls(urls, limit) {
    if (urls.length <= limit) return urls;
    return urls.slice(0, limit);
}

async function run() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help === "true") {
        console.log("Usage: node scripts/seoQaCheck.mjs [--base-url <url>] [--sample-size <n>] [--timeout-ms <n>]");
        process.exit(0);
    }

    const configuredBaseUrl = args["base-url"] || process.env.SEO_QA_BASE_URL || process.env.SITE_URL;
    if (!configuredBaseUrl && process.env.CI) {
        console.log("[seo-qa] Skipped: SEO_QA_BASE_URL is not configured in CI.");
        process.exit(0);
    }

    const baseUrl = normalizeBaseUrl(configuredBaseUrl || DEFAULT_BASE_URL);
    const sampleSize = parsePositiveInt(args["sample-size"] || process.env.SEO_QA_SAMPLE_SIZE, DEFAULT_SAMPLE_SIZE);
    const timeoutMs = parsePositiveInt(args["timeout-ms"] || process.env.SEO_QA_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

    const state = { passes: [], failures: [], warnings: [] };

    console.log(`[seo-qa] base-url=${baseUrl}`);
    console.log(`[seo-qa] sample-size=${sampleSize}`);
    console.log(`[seo-qa] timeout-ms=${timeoutMs}`);

    const robotsUrl = `${baseUrl}/robots.txt`;
    const { response: robotsResponse, body: robotsText } = await fetchText(robotsUrl, timeoutMs);
    assertCondition(state, robotsResponse.ok, `robots is reachable (${robotsUrl})`);

    const robotsSitemaps = extractRobotsSitemaps(robotsText).map((entry) => normalizePathAndQuery(entry));
    for (const path of ["/sitemap.xml", ...EXPECTED_CHILD_SITEMAPS]) {
        assertCondition(
            state,
            robotsSitemaps.includes(path),
            `robots declares sitemap path ${path}`
        );
    }

    const sitemapIndexUrl = `${baseUrl}/sitemap.xml`;
    const { response: sitemapIndexResponse, body: sitemapIndexXml } = await fetchText(sitemapIndexUrl, timeoutMs);
    assertCondition(state, sitemapIndexResponse.ok, `sitemap index is reachable (${sitemapIndexUrl})`);

    const indexLocs = extractLocs(sitemapIndexXml).map((loc) => normalizePathAndQuery(loc));
    for (const childPath of EXPECTED_CHILD_SITEMAPS) {
        assertCondition(
            state,
            indexLocs.includes(childPath),
            `sitemap index includes child sitemap path ${childPath}`
        );
    }

    const childSitemapUrls = {};
    for (const childPath of EXPECTED_CHILD_SITEMAPS) {
        const childUrl = `${baseUrl}${childPath}`;
        const { response, body } = await fetchText(childUrl, timeoutMs);
        assertCondition(state, response.ok, `child sitemap is reachable (${childUrl})`);

        const urls = extractLocs(body);
        childSitemapUrls[childPath] = urls;
        if (urls.length === 0) {
            state.warnings.push(`child sitemap is empty (${childUrl})`);
        }
    }

    const toolsUrls = childSitemapUrls["/sitemaps/tools.xml"] || [];
    const categoriesUrls = childSitemapUrls["/sitemaps/categories.xml"] || [];
    const blogUrls = childSitemapUrls["/sitemaps/blog.xml"] || [];
    const useCaseUrls = childSitemapUrls["/sitemaps/use-cases.xml"] || [];
    const ecosystemsUrls = childSitemapUrls["/sitemaps/ecosystems.xml"] || [];
    const playbooksUrls = childSitemapUrls["/sitemaps/playbooks.xml"] || [];
    const promptsUrls = childSitemapUrls["/sitemaps/prompts.xml"] || [];

    assertCondition(
        state,
        toolsUrls.every((url) => new URL(url).pathname.startsWith("/tools/")),
        "tools sitemap contains only /tools/ URLs"
    );
    assertCondition(
        state,
        categoriesUrls.every((url) => new URL(url).pathname.startsWith("/category/")),
        "categories sitemap contains only /category/ URLs"
    );
    assertCondition(
        state,
        blogUrls.every((url) => new URL(url).pathname.startsWith("/blog/")),
        "blog sitemap contains only /blog/ detail URLs"
    );
    assertCondition(
        state,
        useCaseUrls.some((url) => new URL(url).pathname.startsWith("/best/")),
        "use-cases sitemap includes /best/ URLs"
    );
    assertCondition(
        state,
        ecosystemsUrls.every((url) => new URL(url).pathname.startsWith("/ecosystems/")),
        "ecosystems sitemap contains only /ecosystems/ URLs"
    );
    assertCondition(
        state,
        playbooksUrls.every((url) => new URL(url).pathname.startsWith("/playbooks/")),
        "playbooks sitemap contains only /playbooks/ URLs"
    );
    assertCondition(
        state,
        promptsUrls.every((url) => new URL(url).pathname.startsWith("/prompts/")),
        "prompts sitemap contains only /prompts/ URLs"
    );

    const indexableSamples = [
        ...sampleUrls(toolsUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
        ...sampleUrls(categoriesUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
        ...sampleUrls(blogUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
        ...sampleUrls(useCaseUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
        ...sampleUrls(ecosystemsUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
        ...sampleUrls(playbooksUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
        ...sampleUrls(promptsUrls, sampleSize).map((url) => remapToBaseOrigin(url, baseUrl)),
    ];

    const seen = new Set();
    const uniqueIndexableSamples = indexableSamples.filter((url) => {
        const normalized = normalizeUrlForCompare(url);
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });

    for (const sampleUrl of uniqueIndexableSamples) {
        const seo = await collectPageSeo(sampleUrl, timeoutMs);
        const normalizedSamplePath = normalizePathAndQuery(sampleUrl);
        const normalizedCanonicalPath = seo.canonical ? normalizePathAndQuery(seo.canonical) : null;

        assertCondition(state, seo.status >= 200 && seo.status < 400, `sample URL is reachable (${sampleUrl})`);
        assertCondition(state, Boolean(seo.canonical), `sample URL has canonical tag (${sampleUrl})`);
        assertCondition(
            state,
            normalizedCanonicalPath === normalizedSamplePath,
            `sample URL has self-canonical (${sampleUrl})`
        );
        assertCondition(
            state,
            !seo.noindex,
            `sample URL is indexable (no noindex directive) (${sampleUrl})`
        );
    }

    const noindexTargets = [
        {
            url: `${baseUrl}/search?q=ai`,
            expectedCanonical: `${baseUrl}/search`,
            label: "search results noindex",
        },
        {
            url: `${baseUrl}/blog?page=2`,
            expectedCanonical: `${baseUrl}/blog?page=2`,
            label: "blog pagination noindex",
        },
    ];

    if (categoriesUrls.length > 0) {
        const categoryBaseUrl = remapToBaseOrigin(categoriesUrls[0], baseUrl);
        noindexTargets.push({
            url: `${categoryBaseUrl}?sort=upvotes`,
            expectedCanonical: categoryBaseUrl,
            label: "category facet noindex",
        });
    } else {
        state.warnings.push("could not run category facet noindex check because categories sitemap is empty");
    }

    for (const target of noindexTargets) {
        const seo = await collectPageSeo(target.url, timeoutMs);
        const normalizedCanonicalPath = seo.canonical ? normalizePathAndQuery(seo.canonical) : null;
        const normalizedExpectedCanonicalPath = normalizePathAndQuery(target.expectedCanonical);

        assertCondition(state, seo.status >= 200 && seo.status < 400, `${target.label}: page is reachable (${target.url})`);
        assertCondition(state, seo.noindex, `${target.label}: noindex is present (${target.url})`);
        assertCondition(
            state,
            normalizedCanonicalPath === normalizedExpectedCanonicalPath,
            `${target.label}: canonical is ${target.expectedCanonical}`
        );
    }

    console.log(`[seo-qa] PASS checks: ${state.passes.length}`);
    for (const pass of state.passes) console.log(`  [PASS] ${pass}`);

    if (state.warnings.length > 0) {
        console.log(`[seo-qa] WARNINGS: ${state.warnings.length}`);
        for (const warning of state.warnings) console.log(`  [WARN] ${warning}`);
    }

    if (state.failures.length > 0) {
        console.error(`[seo-qa] FAIL checks: ${state.failures.length}`);
        for (const failure of state.failures) console.error(`  [FAIL] ${failure}`);
        process.exit(1);
    }

    console.log("[seo-qa] All checks passed.");
}

run().catch((error) => {
    console.error("[seo-qa] Fatal error:", error);
    process.exit(1);
});
