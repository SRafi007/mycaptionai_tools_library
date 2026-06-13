export type PromptType =
  | 'chat'
  | 'image'
  | 'video'
  | 'code'
  | 'seo'
  | 'business'
  | 'marketing'
  | 'caption'
  | 'agent'
  | 'workflow'
  | 'other';

export type PromptFormat = 'text' | 'markdown' | 'json' | 'chat_messages' | 'workflow';
export type PromptDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type PromptStatus = 'draft' | 'published' | 'archived';
export type PromptReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Prompt {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  youtube_url: string | null;
  prompt_type: PromptType;
  prompt_format: PromptFormat;
  prompt_body: string;
  prompt_data: any;
  tool_tags: string[];
  tags: string[];
  primary_tool_id: string | null;
  tips: any;
  difficulty: PromptDifficulty;
  use_case: string | null;
  language_code: string;
  status: PromptStatus;
  review_status: PromptReviewStatus;
  is_featured: boolean;
  visual_position: number | null;
  view_count: number;
  copy_count: number;
  favorite_count: number;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  source_url: string | null;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
