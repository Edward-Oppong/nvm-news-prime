
-- Fix RLS policies: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- ===== ARTICLES =====
DROP POLICY IF EXISTS "Admins can manage articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;

CREATE POLICY "Anyone can read published articles"
  ON public.articles FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage articles"
  ON public.articles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===== CATEGORIES =====
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;

CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===== ARTICLE_IMAGES =====
DROP POLICY IF EXISTS "Admins can manage article images" ON public.article_images;
DROP POLICY IF EXISTS "Anyone can read article images" ON public.article_images;

CREATE POLICY "Anyone can read article images"
  ON public.article_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage article images"
  ON public.article_images FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===== AUTHORS (base table - admin only) =====
DROP POLICY IF EXISTS "Admins can manage authors" ON public.authors;
DROP POLICY IF EXISTS "Only admins can read full author data" ON public.authors;

CREATE POLICY "Admins can manage authors"
  ON public.authors FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===== NEWSLETTER_SUBSCRIBERS =====
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only admins can update subscriptions" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update subscriptions"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ===== USER_ROLES =====
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
