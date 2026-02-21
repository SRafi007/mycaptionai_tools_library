import { Metadata } from "next";
import { searchTools } from "@/lib/db/tools";
import ToolCard from "@/components/tool-card";
import SearchBar from "@/components/search-bar";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";

interface PageProps {
    searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { q } = await searchParams;
    const title = q
        ? `Search results for "${q}" — MyCaptionAI`
        : "Search AI Tools — MyCaptionAI";
    return {
        title,
        description: `Search through 4,000+ AI tools to find exactly what you need.${q ? ` Results for: ${q}` : ""}`,
        robots: { index: false, follow: true },
    };
}

const PER_PAGE = 24;

export default async function SearchPage({ searchParams }: PageProps) {
    const { q, page: pageStr } = await searchParams;
    const currentPage = parseInt(pageStr || "1", 10) || 1;
    const query = q?.trim() || "";

    let tools: any[] = [];
    let total = 0;

    if (query) {
        const result = await searchTools(query, currentPage, PER_PAGE);
        tools = result.tools;
        total = result.total;
    }

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <div className="container-main">
            <div className="page-header">
                <h1 className="page-title">Search AI Tools</h1>
                <p className="page-subtitle">
                    Search through thousands of AI tools by name, description, or use case.
                </p>
            </div>

            <div style={{ padding: "24px 0" }}>
                <SearchBar defaultValue={query} />
            </div>

            {query && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 24px" }}>
                    {total > 0
                        ? `Found ${total.toLocaleString()} result${total !== 1 ? "s" : ""} for "${query}"`
                        : `No results for "${query}". Try different keywords.`}
                </p>
            )}

            {tools.length > 0 && (
                <>
                    <div className="tools-grid">
                        {tools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        basePath="/search"
                    />
                </>
            )}

            {!query && (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p className="empty-state-text">
                        Type above to start searching for AI tools.
                    </p>
                </div>
            )}

            <BackToTop />
        </div>
    );
}
