-- Migration: Add missing columns (audio_url and status) to public.articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create index on status column for fast review queue queries
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
