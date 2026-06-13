CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,

    cover_url TEXT,
    youtube_url TEXT,

    prompt_type TEXT NOT NULL DEFAULT 'chat',
    prompt_format TEXT NOT NULL DEFAULT 'markdown',

    prompt_body TEXT NOT NULL,
    prompt_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    tool_tags TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',

    primary_tool_id UUID NULL REFERENCES tools(id) ON DELETE SET NULL,

    tips JSONB NOT NULL DEFAULT '[]'::jsonb,

    difficulty TEXT NOT NULL DEFAULT 'beginner',
    use_case TEXT,
    language_code TEXT NOT NULL DEFAULT 'en',

    status TEXT NOT NULL DEFAULT 'draft',
    review_status TEXT NOT NULL DEFAULT 'pending',

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    visual_position INT,

    view_count INT NOT NULL DEFAULT 0,
    copy_count INT NOT NULL DEFAULT 0,
    favorite_count INT NOT NULL DEFAULT 0,

    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    source_url TEXT,

    created_by UUID NULL,
    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT prompts_prompt_type_check CHECK (
        prompt_type IN (
            'chat',
            'image',
            'video',
            'code',
            'seo',
            'business',
            'marketing',
            'caption',
            'agent',
            'workflow',
            'other'
        )
    ),

    CONSTRAINT prompts_prompt_format_check CHECK (
        prompt_format IN (
            'text',
            'markdown',
            'json',
            'chat_messages',
            'workflow'
        )
    ),

    CONSTRAINT prompts_difficulty_check CHECK (
        difficulty IN ('beginner', 'intermediate', 'advanced')
    ),

    CONSTRAINT prompts_status_check CHECK (
        status IN ('draft', 'published', 'archived')
    ),

    CONSTRAINT prompts_review_status_check CHECK (
        review_status IN ('pending', 'approved', 'rejected')
    )
);

CREATE INDEX idx_prompts_status_published
ON prompts (status, published_at DESC);

CREATE INDEX idx_prompts_primary_tool_id
ON prompts (primary_tool_id);

CREATE INDEX idx_prompts_prompt_type
ON prompts (prompt_type);

CREATE INDEX idx_prompts_featured_position
ON prompts (is_featured, visual_position);

CREATE INDEX idx_prompts_tool_tags
ON prompts USING GIN (tool_tags);

CREATE INDEX idx_prompts_tags
ON prompts USING GIN (tags);

CREATE INDEX idx_prompts_prompt_data
ON prompts USING GIN (prompt_data);

CREATE INDEX idx_prompts_search
ON prompts
USING GIN (
    to_tsvector(
        'english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(prompt_body, '')
    )
);

CREATE OR REPLACE FUNCTION update_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_prompts_updated_at();
