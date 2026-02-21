import { Metadata } from "next";
import { getCategories } from "@/lib/db/categories";
import CategoryCard from "@/components/category-card";
import BackToTop from "@/components/back-to-top";

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

            <BackToTop />
        </div>
    );
}
