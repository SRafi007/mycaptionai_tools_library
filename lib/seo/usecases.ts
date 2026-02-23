export interface UseCaseConfig {
    slug: string;
    title: string;
    description: string;
    categorySlugs: string[];
}

export const USE_CASES: UseCaseConfig[] = [
    {
        slug: "free-marketing-ai-tools",
        title: "Best Free Marketing AI Tools",
        description: "Explore free and freemium AI tools for marketing workflows, copy, SEO, and growth campaigns.",
        categorySlugs: ["marketing", "copywriting", "seo", "social-media"],
    },
    {
        slug: "ai-agents-for-startups",
        title: "Best AI Agents for Startups",
        description: "Find practical AI agents and automation tools for startup ops, execution speed, and lean teams.",
        categorySlugs: ["ai-agents", "startup-tools", "workflows", "project-management"],
    },
    {
        slug: "ai-chatbots-for-customer-support",
        title: "Best AI Chatbots for Customer Support",
        description: "Compare top AI chatbot tools for support teams, resolution speed, and automation quality.",
        categorySlugs: ["ai-chatbots", "customer-support", "workflows"],
    },
    {
        slug: "ai-tools-for-ecommerce-growth",
        title: "Best AI Tools for Ecommerce Growth",
        description: "Discover AI tools for ecommerce marketing, product copy, customer support, and conversion growth.",
        categorySlugs: ["e-commerce", "marketing", "sales-assistant", "customer-support"],
    },
    {
        slug: "ai-video-tools-for-creators",
        title: "Best AI Video Tools for Creators",
        description: "Find top AI tools for script-to-video, editing, and creator content production workflows.",
        categorySlugs: ["video-generators", "video-editing", "text-to-video"],
    },
    {
        slug: "free-ai-coding-tools",
        title: "Best Free AI Coding Tools",
        description: "Compare free and freemium coding assistants, low-code builders, and developer AI tools.",
        categorySlugs: ["code-assistant", "low-code-no-code", "sql"],
    },
];

export const USE_CASE_MAP = new Map(USE_CASES.map((entry) => [entry.slug, entry]));
