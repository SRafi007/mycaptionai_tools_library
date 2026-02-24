import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

interface Crumb {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: Crumb[];
    currentPath?: string;
}

export default function Breadcrumbs({ items, currentPath }: BreadcrumbsProps) {
    const allItems: Crumb[] = [{ label: "Home", href: "/" }, ...items];
    const listSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const href = item.href || (isLast ? currentPath : undefined) || "/";
            return {
                "@type": "ListItem",
                position: index + 1,
                name: item.label,
                item: absoluteUrl(href),
            };
        }),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
            />
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <ol className="breadcrumbs-list">
                    <li className="breadcrumbs-item">
                        <Link href="/" className="breadcrumbs-link">
                            Home
                        </Link>
                    </li>
                    {items.map((item, i) => (
                        <li key={i} className="breadcrumbs-item">
                            <span className="breadcrumbs-sep" aria-hidden="true">/</span>
                            {item.href ? (
                                <Link href={item.href} className="breadcrumbs-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="breadcrumbs-current" aria-current="page">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
