-- ====================================================================
-- Migration: Newsletter Subscribers & Storage Bucket Setup
-- ====================================================================

-- 1. Create newsletter_subscribers table if not exists
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  unsubscribed_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for fast lookup & analytics
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON public.newsletter_subscribers (subscribed_at);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only authenticated admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;

-- Policy 1: Anyone (visitors & subscribers) can insert their email to subscribe
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: ONLY logged-in authenticated users/admins can view subscriber list and count
CREATE POLICY "Only authenticated admins can view subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Logged-in admins can update subscriptions (e.g., set unsubscribed_at)
CREATE POLICY "Admins can update subscriptions"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy 4: Logged-in admins can delete subscriptions
CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);


-- 2. Setup article-audios storage bucket & policies for story voice/audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-audios',
  'article-audios',
  true,
  52428800, -- 50MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/webm', 'audio/flac', 'audio/x-m4a', 'audio/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/webm', 'audio/flac', 'audio/x-m4a', 'audio/mp4', 'video/webm'];

-- Storage bucket RLS policies for article-audios
DROP POLICY IF EXISTS "Public read access for article-audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload to article-audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update article-audios" ON storage.objects;

CREATE POLICY "Public read access for article-audios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-audios');

CREATE POLICY "Authenticated users upload to article-audios"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-audios');

CREATE POLICY "Authenticated users update article-audios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-audios');
