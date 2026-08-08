-- Migration: Add reviewed_by, reviewed_by_name, and reviewed_at columns to public.articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.authors(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reviewed_by_name TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index on reviewed_by column
CREATE INDEX IF NOT EXISTS idx_articles_reviewed_by ON public.articles(reviewed_by);
