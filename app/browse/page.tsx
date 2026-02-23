import { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/db/categories";
import CategoryCard from "@/components/category-card";
import BackToTop from "@/components/back-to-top";
import { USE_CASES } from "@/lib/seo/usecases";

export const metadata: Metadata = {
    title: "Browse AI Tool Categories — MyCaptionAI",
    description:
        "Explore all AI tool categories. Find the best AI tools for writing, image generation, video, marketing, coding, and more.",
};

export default async function BrowsePage() {
    const categories = await getCategories();

    return (
        <div className="container-main">
            <div className="page-header">
                <h1 className="page-title">Browse All Categories</h1>
                <p className="page-subtitle">
                    Explore {categories.length} categories to find the perfect AI tool for your needs.
                </p>
            </div>

            <div className="section-padding">
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} />
                    ))}
                </div>
            </div>

            <section className="section-padding section-border-t">
                <div className="section-header">
                    <h2 className="section-title">Best AI Tools by Use Case</h2>
                    <span className="section-count">{USE_CASES.length} pages</span>
                </div>
                <div className="categories-grid">
                    {USE_CASES.map((useCase) => (
                        <Link key={useCase.slug} href={`/best/${useCase.slug}`} className="card" style={{ padding: "16px" }}>
                            <h3 style={{ margin: "0 0 8px", fontSize: "15px", color: "var(--text-primary)" }}>{useCase.title}</h3>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                {useCase.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
