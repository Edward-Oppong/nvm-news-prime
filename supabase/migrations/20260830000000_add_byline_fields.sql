-- Migration: Add writer_name, author_name, publisher_name, and title_font_size to articles table
-- These are free-text credit/byline fields for the three-tier hierarchy display

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS writer_name TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS publisher_name TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS title_font_size TEXT DEFAULT 'text-4xl';

-- Index for people search
CREATE INDEX IF NOT EXISTS idx_articles_writer_name ON public.articles(writer_name);
CREATE INDEX IF NOT EXISTS idx_articles_author_name ON public.articles(author_name);
CREATE INDEX IF NOT EXISTS idx_articles_publisher_name ON public.articles(publisher_name);
