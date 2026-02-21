export interface Tool {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    url: string | null;
    image_url: string | null;
    icon_url: string | null;
    pricing_type: "Free" | "Freemium" | "Paid" | "Free-Trial" | "Contact" | null;
    is_verified: boolean;
    is_featured: boolean;
    rating_score: number;
    rating_count: number;
    upvotes: number;
    publisher: string | null;
    features: string[];
    pros_cons: { pros?: string[]; cons?: string[] };
    use_cases: string[];
    source: string | null;
    click_count: number;
    created_at: string;
    updated_at: string;
}

export interface ToolWithCategories extends Tool {
    categories: { id: string; name: string; slug: string }[];
}
