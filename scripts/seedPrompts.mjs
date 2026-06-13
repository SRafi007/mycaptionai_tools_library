import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyPrompts = [
  // CHAT PROMPTS
  {
    slug: 'youtube-script-generator-chat',
    title: 'YouTube Script Generator',
    description: 'Generates a highly engaging YouTube script based on a given topic, including hooks, intros, and call to actions.',
    cover_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    youtube_url: null,
    prompt_type: 'chat',
    prompt_format: 'text',
    prompt_body: 'Act as an expert YouTube scriptwriter. Write a 5-minute video script about {{topic}}. Include an engaging hook, a brief intro, the main content broken down into 3 points, and a strong call to action.',
    tags: ['youtube', 'script', 'video'],
    tool_tags: ['ChatGPT', 'Claude'],
    copy_count: 154,
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    slug: 'blog-post-outline-generator',
    title: 'Blog Post Outline Generator',
    description: 'Create a comprehensive SEO-friendly blog post outline.',
    cover_url: null,
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy video
    prompt_type: 'chat',
    prompt_format: 'text',
    prompt_body: 'Generate an SEO-optimized blog outline for the topic: {{topic}}. Include H2 and H3 headings, and bullet points for the main points to cover under each section.',
    tags: ['blogging', 'seo', 'writing'],
    tool_tags: ['Gemini', 'ChatGPT'],
    copy_count: 89,
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    slug: 'linkedin-viral-post',
    title: 'LinkedIn Viral Post Writer',
    description: 'Write a catchy LinkedIn post with line breaks and engaging hooks.',
    cover_url: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&q=80',
    youtube_url: null,
    prompt_type: 'chat',
    prompt_format: 'text',
    prompt_body: 'Write a LinkedIn post about {{topic}}. Start with a bold statement. Keep paragraphs short (1-2 sentences). End with a question to encourage comments.',
    tags: ['linkedin', 'social-media', 'viral'],
    tool_tags: ['Claude', 'ChatGPT'],
    copy_count: 231,
    status: 'published',
    published_at: new Date().toISOString()
  },

  // IMAGE PROMPTS
  {
    slug: 'cinematic-portrait-midjourney',
    title: 'Cinematic Portrait',
    description: 'Prompt for generating hyper-realistic cinematic portraits in Midjourney.',
    cover_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    youtube_url: null,
    prompt_type: 'image',
    prompt_format: 'text',
    prompt_body: 'Cinematic portrait of a {{subject}}, dramatic lighting, neon reflections, shot on 35mm lens, f/1.8, extremely detailed, 8k, photorealistic --ar 16:9',
    tags: ['midjourney', 'portrait', 'realistic'],
    tool_tags: ['Midjourney', 'DALL-E 3'],
    copy_count: 512,
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    slug: 'watercolor-landscape-illustration',
    title: 'Watercolor Landscape',
    description: 'Soft and dreamy watercolor landscapes.',
    cover_url: 'https://images.unsplash.com/photo-1542224566-6e85f2e10628?w=800&q=80',
    youtube_url: null,
    prompt_type: 'image',
    prompt_format: 'text',
    prompt_body: 'Beautiful watercolor painting of a {{scenery}}, soft pastel colors, dreamy atmosphere, Studio Ghibli style, detailed',
    tags: ['watercolor', 'landscape', 'illustration'],
    tool_tags: ['Midjourney', 'Stable Diffusion'],
    copy_count: 120,
    status: 'published',
    published_at: new Date().toISOString()
  },

  // CODE PROMPTS
  {
    slug: 'react-component-generator',
    title: 'React Component Generator',
    description: 'Generate fully typed React components with TailwindCSS.',
    cover_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    youtube_url: null,
    prompt_type: 'code',
    prompt_format: 'text',
    prompt_body: 'Create a React functional component for a {{component_name}}. Use TypeScript and TailwindCSS for styling. Include props interface and a basic usage example.',
    tags: ['react', 'typescript', 'frontend'],
    tool_tags: ['ChatGPT', 'Claude', 'Copilot'],
    copy_count: 345,
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    slug: 'sql-query-optimizer',
    title: 'SQL Query Optimizer',
    description: 'Analyze and optimize slow SQL queries.',
    cover_url: null,
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    prompt_type: 'code',
    prompt_format: 'text',
    prompt_body: 'Analyze the following SQL query and suggest optimizations for better performance. Explain the suggested changes and provide the optimized query. \n\nQuery: {{query}}',
    tags: ['sql', 'database', 'optimization'],
    tool_tags: ['ChatGPT', 'Claude'],
    copy_count: 78,
    status: 'published',
    published_at: new Date().toISOString()
  },

  // VIDEO PROMPTS
  {
    slug: 'sora-drone-flythrough',
    title: 'Drone Flythrough (Sora)',
    description: 'Create realistic drone flythrough videos.',
    cover_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80',
    youtube_url: null,
    prompt_type: 'video',
    prompt_format: 'text',
    prompt_body: 'FPV drone flythrough of a {{location}}, starting from outside, flying through a narrow window, and revealing a bustling interior. Realistic lighting, 4k resolution, 60fps.',
    tags: ['sora', 'drone', 'fpv'],
    tool_tags: ['Sora', 'Runway'],
    copy_count: 432,
    status: 'published',
    published_at: new Date().toISOString()
  },

  // SEO PROMPTS
  {
    slug: 'seo-keyword-cluster',
    title: 'Keyword Clustering',
    description: 'Group keywords by search intent.',
    cover_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80',
    youtube_url: null,
    prompt_type: 'seo',
    prompt_format: 'text',
    prompt_body: 'Group the following list of keywords into thematic clusters based on search intent. Provide the output as a Markdown table with columns: Cluster Name, Search Intent, and Keywords. \n\nKeywords: {{keywords}}',
    tags: ['seo', 'keywords', 'strategy'],
    tool_tags: ['ChatGPT', 'Claude'],
    copy_count: 210,
    status: 'published',
    published_at: new Date().toISOString()
  }
];

async function seedPrompts() {
  console.log('Seeding dummy prompts...');

  for (const p of dummyPrompts) {
    const { data, error } = await supabase
      .from('prompts')
      .upsert(p, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`Error inserting ${p.slug}:`, error.message);
    } else {
      console.log(`Inserted prompt: ${p.title}`);
    }
  }

  console.log('Seeding complete.');
}

seedPrompts();
