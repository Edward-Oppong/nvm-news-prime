-- ====================================================================
-- Add article-audios storage bucket + RLS policies
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-audios',
  'article-audios',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/webm', 'audio/flac', 'audio/x-m4a']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS policies
DROP POLICY IF EXISTS "Public view for article-audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload article-audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update article-audios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete article-audios" ON storage.objects;

CREATE POLICY "Public view for article-audios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-audios');

CREATE POLICY "Authenticated users upload article-audios"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-audios');

CREATE POLICY "Authenticated users update article-audios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-audios');

CREATE POLICY "Authenticated users delete article-audios"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-audios');
