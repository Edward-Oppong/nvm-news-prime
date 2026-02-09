-- Add video_url column to articles table for video content
ALTER TABLE public.articles
ADD COLUMN video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.video_url IS 'URL to the featured video for the article';