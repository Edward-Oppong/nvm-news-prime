-- ====================================================================
-- Add article view_count column + increment function
-- ====================================================================

-- 1. Add view_count column to articles
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS view_count bigint DEFAULT 0 NOT NULL;

-- 2. Create a security-definer function to safely increment view count
--    (avoids needing UPDATE RLS on articles for anonymous users)
CREATE OR REPLACE FUNCTION increment_article_view(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;

-- 3. Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION increment_article_view(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_article_view(uuid) TO authenticated;
