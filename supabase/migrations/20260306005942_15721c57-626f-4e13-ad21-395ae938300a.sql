
-- Allow public read on authors so authors_public view works for anonymous users
-- The view already strips sensitive fields (email, user_id)
CREATE POLICY "Anyone can read public author data via view"
  ON public.authors FOR SELECT
  USING (true);
