"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    basePath,
}: PaginationProps) {
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    function buildHref(page: number): string {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete("page");
        } else {
            params.set("page", page.toString());
        }
        const qs = params.toString();
        return qs ? `${basePath}?${qs}` : basePath;
    }

    // Generate page numbers to show
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <nav className="pagination" aria-label="Pagination">
            {currentPage > 1 && (
                <Link href={buildHref(currentPage - 1)} className="pagination-btn">
                    ← Prev
                </Link>
            )}

            <div className="pagination-pages">
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`dots-${i}`} className="pagination-dots">…</span>
                    ) : (
                        <Link
                            key={p}
                            href={buildHref(p)}
                            className={`pagination-page ${currentPage === p ? "pagination-page-active" : ""}`}
                        >
                            {p}
                        </Link>
                    )
                )}
            </div>

            {currentPage < totalPages && (
                <Link href={buildHref(currentPage + 1)} className="pagination-btn">
                    Next →
                </Link>
            )}
        </nav>
    );
}
