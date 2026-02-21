import Link from "next/link";

interface Crumb {
    label: string;
    href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
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
    );
}
