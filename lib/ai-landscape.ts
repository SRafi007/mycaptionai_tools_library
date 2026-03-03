export interface AiLandscapeTool {
    name: string;
    slug: string;
}

export interface AiLandscapeRow {
    country: string;
    iso: string;
    company: string;
    published_on: string;
    tools: AiLandscapeTool[];
}

export interface CountryCompany {
    name: string;
    publishedOn: string;
}

export interface CountryLandscape {
    country: string;
    countrySlug: string;
    iso: string;
    companies: CountryCompany[];
    tools: AiLandscapeTool[];
    companyCount: number;
    toolCount: number;
    firstPublishedOn: string | null;
    lastPublishedOn: string | null;
}

export interface CountryMarkerCoordinate {
    x: number;
    y: number;
    labelX?: number;
    labelY?: number;
}

export const COUNTRY_MARKER_COORDS: Record<string, CountryMarkerCoordinate> = {
    US: { x: 228, y: 145, labelY: 169 },
    CA: { x: 206, y: 98, labelY: 77 },
    GB: { x: 495, y: 102, labelY: 81 },
    FR: { x: 506, y: 126, labelY: 149 },
    DE: { x: 529, y: 110, labelY: 89 },
    NL: { x: 514, y: 104, labelX: 490, labelY: 89 },
    NO: { x: 522, y: 82, labelY: 61 },
    IL: { x: 598, y: 167, labelY: 190 },
    AE: { x: 650, y: 184, labelY: 206 },
    IN: { x: 717, y: 191, labelY: 214 },
    CN: { x: 789, y: 155, labelY: 178 },
    KR: { x: 853, y: 151, labelX: 875, labelY: 132 },
    JP: { x: 883, y: 148, labelX: 905, labelY: 131 },
};

export function countryToSlug(country: string): string {
    return country
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function isoToFlag(iso: string): string {
    const normalized = iso.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "N/A";
    return normalized.replace(/[A-Z]/g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export function aggregateLandscapeByCountry(rows: AiLandscapeRow[]): CountryLandscape[] {
    const countryMap = new Map<
        string,
        {
            country: string;
            iso: string;
            companies: Map<string, CountryCompany>;
            tools: Map<string, AiLandscapeTool>;
            firstPublishedOn: string | null;
            lastPublishedOn: string | null;
        }
    >();

    for (const row of rows) {
        const iso = row.iso.trim().toUpperCase();
        if (!iso) continue;

        const existing = countryMap.get(iso);
        if (!existing) {
            countryMap.set(iso, {
                country: row.country.trim(),
                iso,
                companies: new Map(),
                tools: new Map(),
                firstPublishedOn: row.published_on || null,
                lastPublishedOn: row.published_on || null,
            });
        }

        const countryEntry = countryMap.get(iso);
        if (!countryEntry) continue;

        const companyName = row.company.trim();
        if (companyName) {
            countryEntry.companies.set(companyName.toLowerCase(), {
                name: companyName,
                publishedOn: row.published_on,
            });
        }

        for (const tool of row.tools || []) {
            const toolName = tool.name?.trim();
            if (!toolName) continue;
            const toolKey = (tool.slug?.trim().toLowerCase() || toolName.toLowerCase());
            countryEntry.tools.set(toolKey, {
                name: toolName,
                slug: tool.slug?.trim() || "",
            });
        }

        if (row.published_on) {
            if (!countryEntry.firstPublishedOn || row.published_on < countryEntry.firstPublishedOn) {
                countryEntry.firstPublishedOn = row.published_on;
            }
            if (!countryEntry.lastPublishedOn || row.published_on > countryEntry.lastPublishedOn) {
                countryEntry.lastPublishedOn = row.published_on;
            }
        }
    }

    return Array.from(countryMap.values())
        .map((entry) => {
            const companies = Array.from(entry.companies.values()).sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            const tools = Array.from(entry.tools.values()).sort((a, b) => a.name.localeCompare(b.name));

            return {
                country: entry.country,
                countrySlug: countryToSlug(entry.country),
                iso: entry.iso,
                companies,
                tools,
                companyCount: companies.length,
                toolCount: tools.length,
                firstPublishedOn: entry.firstPublishedOn,
                lastPublishedOn: entry.lastPublishedOn,
            } satisfies CountryLandscape;
        })
        .sort((a, b) => {
            if (b.toolCount !== a.toolCount) return b.toolCount - a.toolCount;
            return a.country.localeCompare(b.country);
        });
}

export function getCountryBySlug(countries: CountryLandscape[], slug: string): CountryLandscape | null {
    return countries.find((entry) => entry.countrySlug === slug) || null;
}
