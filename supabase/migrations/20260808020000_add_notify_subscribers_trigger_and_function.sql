-- Migration: Create SQL trigger function and columns for notifying subscribers and tracking article reviewers

-- 1. Ensure all columns exist on public.articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.authors(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reviewed_by_name TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- 2. Create PostgreSQL Function for Article Publication Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_notify_subscribers_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Trigger only when an article transitions to published = true
  IF (TG_OP = 'INSERT' AND NEW.published = true) OR
     (TG_OP = 'UPDATE' AND NEW.published = true AND (OLD.published IS DISTINCT FROM true)) THEN

    payload := jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug,
      'excerpt', COALESCE(NEW.excerpt, ''),
      'image_url', COALESCE(NEW.image_url, '')
    );

    -- Try sending HTTP POST request to notify-subscribers Edge Function using pg_net extension if enabled
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        PERFORM net.http_post(
          url := COALESCE(current_setting('app.settings.supabase_url', true), '') || '/functions/v1/notify-subscribers',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || COALESCE(current_setting('app.settings.service_role_key', true), '')
          ),
          body := payload
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log notice if pg_net HTTP call fails, allowing transaction to complete cleanly
      RAISE NOTICE 'Notification trigger HTTP dispatch handled: %', SQLERRM;
    END;

  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach Trigger to public.articles table
DROP TRIGGER IF EXISTS tr_notify_subscribers_on_article_publish ON public.articles;
CREATE TRIGGER tr_notify_subscribers_on_article_publish
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notify_subscribers_on_publish();
