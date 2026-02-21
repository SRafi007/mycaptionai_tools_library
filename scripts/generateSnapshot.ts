import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing environment variables. Please check .env.local")
    console.error("SUPABASE_URL:", supabaseUrl)
    console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "[HIDDEN]" : undefined)
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log("🌱 Seeding database...")

    // ------------------------
    // Categories
    // ------------------------

    const categories = [
        { name: "AI Writing", slug: "ai-writing" },
        { name: "Image Generation", slug: "image-generation" },
        { name: "Video Generation", slug: "video-generation" },
        { name: "Code Assistant", slug: "code-assistant" },
        { name: "Marketing", slug: "marketing" },
        { name: "Productivity", slug: "productivity" },
    ]

    const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .insert(categories)
        .select()

    if (categoryError) {
        console.error("❌ Error inserting categories:", categoryError)
        return
    }
    console.log(`✅ Inserted ${categoryData?.length} categories`)

    // ------------------------
    // Tags
    // ------------------------

    const tags = [
        { name: "Chatbot", slug: "chatbot" },
        { name: "SEO", slug: "seo" },
        { name: "Copywriting", slug: "copywriting" },
        { name: "Automation", slug: "automation" },
        { name: "YouTube", slug: "youtube" },
        { name: "Social Media", slug: "social-media" },
        { name: "Design", slug: "design" },
    ]

    const { data: tagData, error: tagError } = await supabase
        .from("tags")
        .insert(tags)
        .select()

    if (tagError) {
        console.error("❌ Error inserting tags:", tagError)
        return
    }
    console.log(`✅ Inserted ${tagData?.length} tags`)

    // Helper maps
    const catMap = Object.fromEntries(
        categoryData!.map(c => [c.slug, c.id])
    )

    const tagMap = Object.fromEntries(
        tagData!.map(t => [t.slug, t.id])
    )

    // ------------------------
    // Tools (REAL AI PRODUCTS)
    // ------------------------

    const tools = [
        {
            name: "ChatGPT",
            slug: "chatgpt",
            short_description: "Advanced conversational AI by OpenAI.",
            long_description:
                "ChatGPT is a conversational AI model capable of generating text, answering questions, writing code, and assisting across multiple domains.",
            url: "https://chat.openai.com",
            image_url: "https://openai.com/favicon.ico",
            pricing_type: "Freemium",
            is_verified: true,
            company_name: "OpenAI",
            launch_year: 2022,
            priority_score: 10,
        },
        {
            name: "Midjourney",
            slug: "midjourney",
            short_description: "AI-powered artistic image generation.",
            long_description:
                "Midjourney generates high-quality artistic images from text prompts, widely used by designers and creators.",
            url: "https://www.midjourney.com",
            image_url: "https://www.midjourney.com/favicon.ico",
            pricing_type: "Paid",
            company_name: "Midjourney Inc.",
            launch_year: 2022,
            priority_score: 9,
        },
        {
            name: "Notion AI",
            slug: "notion-ai",
            short_description: "AI writing assistant inside Notion.",
            long_description:
                "Notion AI helps users write, summarize, brainstorm and automate workflows directly within Notion.",
            url: "https://www.notion.so/product/ai",
            image_url: "https://www.notion.so/favicon.ico",
            pricing_type: "Freemium",
            company_name: "Notion",
            priority_score: 8,
        },
        {
            name: "GitHub Copilot",
            slug: "github-copilot",
            short_description: "AI coding assistant for developers.",
            long_description:
                "GitHub Copilot provides AI-powered code suggestions and auto-completions directly in your IDE.",
            url: "https://github.com/features/copilot",
            image_url: "https://github.com/favicon.ico",
            pricing_type: "Paid",
            company_name: "GitHub",
            priority_score: 9,
        },
        {
            name: "Runway",
            slug: "runway",
            short_description: "AI-powered video generation and editing.",
            long_description:
                "Runway enables creators to generate and edit videos using AI models including text-to-video.",
            url: "https://runwayml.com",
            image_url: "https://runwayml.com/favicon.ico",
            pricing_type: "Freemium",
            priority_score: 8,
        },
        {
            name: "Canva AI",
            slug: "canva-ai",
            short_description: "AI design tools inside Canva.",
            long_description:
                "Canva AI offers text-to-image, magic design, and AI-powered editing features.",
            url: "https://www.canva.com",
            image_url: "https://www.canva.com/favicon.ico",
            pricing_type: "Freemium",
            priority_score: 7,
        },
        {
            name: "Jasper",
            slug: "jasper-ai",
            short_description: "AI marketing and copywriting tool.",
            long_description:
                "Jasper is designed for marketing teams to create blogs, ads, and social media content using AI.",
            url: "https://www.jasper.ai",
            image_url: "https://www.jasper.ai/favicon.ico",
            pricing_type: "Paid",
            priority_score: 7,
        },
        {
            name: "Synthesia",
            slug: "synthesia",
            short_description: "AI avatar video creation platform.",
            long_description:
                "Synthesia allows users to create AI-generated video presentations with digital avatars.",
            url: "https://www.synthesia.io",
            image_url: "https://www.synthesia.io/favicon.ico",
            pricing_type: "Paid",
            priority_score: 8,
        },
        {
            name: "Grammarly",
            slug: "grammarly",
            short_description: "AI writing assistant and grammar checker.",
            long_description:
                "Grammarly enhances writing with AI-powered grammar, clarity, and tone suggestions.",
            url: "https://www.grammarly.com",
            image_url: "https://www.grammarly.com/favicon.ico",
            pricing_type: "Freemium",
            priority_score: 8,
        },
        {
            name: "Pictory",
            slug: "pictory",
            short_description: "AI tool for turning scripts into videos.",
            long_description:
                "Pictory converts blog posts and scripts into short AI-generated videos for social media.",
            url: "https://pictory.ai",
            image_url: "https://pictory.ai/favicon.ico",
            pricing_type: "Freemium",
            priority_score: 6,
        },
    ]

    const { data: toolData, error: toolError } = await supabase
        .from("tools")
        .insert(tools)
        .select()

    if (toolError) {
        console.error("❌ Error inserting tools:", toolError)
        return
    }
    console.log(`✅ Inserted ${toolData?.length} tools`)

    // ------------------------
    // Tool ↔ Category Relations
    // ------------------------

    const relations = [
        { tool: "chatgpt", category: "ai-writing" },
        { tool: "midjourney", category: "image-generation" },
        { tool: "github-copilot", category: "code-assistant" },
        { tool: "runway", category: "video-generation" },
        { tool: "jasper-ai", category: "marketing" },
        { tool: "notion-ai", category: "productivity" },
    ]

    const toolMap = Object.fromEntries(
        toolData!.map(t => [t.slug, t.id])
    )

    const toolCategories = relations.map(r => ({
        tool_id: toolMap[r.tool],
        category_id: catMap[r.category],
    }))

    const { error: relationError } = await supabase.from("tool_categories").insert(toolCategories)

    if (relationError) {
        console.error("❌ Error inserting tool_categories:", relationError)
        return
    }

    console.log("✅ Seeding complete.")
}

seed().catch(console.error)
