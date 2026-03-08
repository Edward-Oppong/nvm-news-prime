
-- Table for multiple videos per article
CREATE TABLE public.article_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  video_type text NOT NULL DEFAULT 'upload', -- 'upload' or 'embed'
  title text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.article_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article videos"
  ON public.article_videos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage article videos"
  ON public.article_videos FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
