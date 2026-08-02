-- ====================================================================
-- SUPABASE STORAGE BUCKET CREATION & RLS POLICIES SCRIPT
-- Project: NVM News Prime
-- Buckets: article-images, article-videos, avatars, category-banners
-- ====================================================================

-- 1. CREATE ALL BUCKETS (ON CONFLICT DO NOTHING / UPSERT)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'article-images', 
    'article-images', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  ),
  (
    'article-videos', 
    'article-videos', 
    true, 
    104857600, -- 100MB limit
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
  ),
  (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'category-banners', 
    'category-banners', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  )
ON CONFLICT (id) DO UPDATE SET 
  public = true;


-- ====================================================================
-- 2. RLS POLICIES FOR 'article-images' BUCKET
-- ====================================================================
DROP POLICY IF EXISTS "Public view for article-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload article-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update article-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete article-images" ON storage.objects;

CREATE POLICY "Public view for article-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users upload article-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "Authenticated users update article-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users delete article-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');


-- ====================================================================
-- 3. RLS POLICIES FOR 'article-videos' BUCKET
-- ====================================================================
DROP POLICY IF EXISTS "Public view for article-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload article-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update article-videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete article-videos" ON storage.objects;

CREATE POLICY "Public view for article-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-videos');

CREATE POLICY "Authenticated users upload article-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-videos');

CREATE POLICY "Authenticated users update article-videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-videos');

CREATE POLICY "Authenticated users delete article-videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-videos');


-- ====================================================================
-- 4. RLS POLICIES FOR 'avatars' BUCKET
-- ====================================================================
DROP POLICY IF EXISTS "Public view for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete avatars" ON storage.objects;

CREATE POLICY "Public view for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');


-- ====================================================================
-- 5. RLS POLICIES FOR 'category-banners' BUCKET
-- ====================================================================
DROP POLICY IF EXISTS "Public view for category-banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload category-banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update category-banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete category-banners" ON storage.objects;

CREATE POLICY "Public view for category-banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-banners');

CREATE POLICY "Authenticated users upload category-banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'category-banners');

CREATE POLICY "Authenticated users update category-banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'category-banners');

CREATE POLICY "Authenticated users delete category-banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'category-banners');
