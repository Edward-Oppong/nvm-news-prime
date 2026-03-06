
-- Create a dedicated video storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('article-videos', 'article-videos', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- RLS for article-videos bucket: anyone can read, admins can upload/delete
CREATE POLICY "Anyone can read videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-videos');

CREATE POLICY "Admins can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-videos' AND public.is_admin());

CREATE POLICY "Admins can delete videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-videos' AND public.is_admin());
