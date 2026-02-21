"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterBarProps {
    currentSort?: string;
    currentPricing?: string;
    totalCount?: number;
}

const sortOptions = [
    { value: "rating", label: "Top Rated" },
    { value: "upvotes", label: "Most Upvoted" },
    { value: "newest", label: "Newest" },
    { value: "name", label: "A-Z" },
];

const pricingOptions = [
    { value: "all", label: "All Pricing" },
    { value: "Free", label: "Free" },
    { value: "Freemium", label: "Freemium" },
    { value: "Paid", label: "Paid" },
    { value: "Free-Trial", label: "Free Trial" },
];

export default function FilterBar({
    currentSort = "rating",
    currentPricing = "all",
    totalCount,
}: FilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(key, value);
            params.delete("page"); // reset page on filter change
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    return (
        <div className="filter-bar">
            <div className="filter-bar-left">
                {totalCount !== undefined && (
                    <span className="filter-bar-count">
                        {totalCount.toLocaleString()} tools
                    </span>
                )}
            </div>
            <div className="filter-bar-right">
                <div className="filter-group">
                    {pricingOptions.map((opt) => (
                        <button
                            key={opt.value}
                            className={`filter-pill ${currentPricing === opt.value ? "filter-pill-active" : ""}`}
                            onClick={() => updateFilter("pricing", opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <select
                    className="filter-select"
                    value={currentSort}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
