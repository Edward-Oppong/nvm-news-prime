-- Fix 1: Restrict public access to author emails (only admins can see emails)
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read authors" ON public.authors;

-- Create a view for public author info (excludes email)
CREATE OR REPLACE VIEW public.authors_public AS
SELECT id, name, bio, avatar_url, created_at, updated_at
FROM public.authors;

-- Create policy: Public can only read non-sensitive author info via the view
-- For the base table, only admins can read (which includes email)
CREATE POLICY "Only admins can read full author data" 
ON public.authors 
FOR SELECT 
USING (public.is_admin());

-- Fix 2: Newsletter subscribers - restrict UPDATE to only allow users to update their OWN subscription via email match
-- This prevents anyone from mass-unsubscribing other users
DROP POLICY IF EXISTS "Anyone can update their subscription status" ON public.newsletter_subscribers;

-- Create a more restrictive update policy - users can only update records matching their email
-- Since we don't have authenticated users for newsletter, we'll use a token-based approach
-- For now, restrict UPDATE to admins only (safest approach)
CREATE POLICY "Only admins can update subscriptions" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (public.is_admin());