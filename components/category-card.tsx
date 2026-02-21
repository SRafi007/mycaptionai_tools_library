import Link from "next/link";
import { Category } from "@/types/category";

const categoryIcons: Record<string, string> = {
    "text-generators": "✍️",
    "image-generators": "🎨",
    "video-generators": "🎬",
    "audio-generators": "🎵",
    "code-generators": "💻",
    "chatbots": "💬",
    "marketing": "📈",
    "productivity": "⚡",
    "writing": "📝",
    "design": "🎯",
    "education": "📚",
    "research": "🔬",
    "business": "💼",
    "social-media": "📱",
    "seo": "🔍",
    "automation": "🤖",
    "analytics": "📊",
    "e-commerce": "🛒",
    "healthcare": "🏥",
    "finance": "💰",
    "customer-service": "🎧",
    "hr": "👥",
    "legal": "⚖️",
    "music": "🎶",
    "gaming": "🎮",
    "photo-editing": "📸",
    "presentation": "📊",
    "transcription": "📋",
    "translation": "🌐",
    "email": "📧",
};

function getCategoryIcon(slug: string): string {
    for (const [key, icon] of Object.entries(categoryIcons)) {
        if (slug.includes(key)) return icon;
    }
    return "🔧";
}

export default function CategoryCard({ category }: { category: Category }) {
    return (
        <Link href={`/category/${category.slug}`} className="category-card">
            <div className="category-card-icon">{getCategoryIcon(category.slug)}</div>
            <div className="category-card-info">
                <h3 className="category-card-name">{category.name}</h3>
                <span className="category-card-count">
                    {category.tool_count} {category.tool_count === 1 ? "tool" : "tools"}
                </span>
            </div>
            <svg
                className="category-card-arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M9 18l6-6-6-6" />
            </svg>
        </Link>
    );
}
