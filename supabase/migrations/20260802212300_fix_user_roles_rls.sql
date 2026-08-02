-- Fix: Allow users to read their OWN role from user_roles.
--
-- Previously, only existing admins could query user_roles (via is_admin()).
-- This created a chicken-and-egg problem: a new admin can't be recognised
-- as an admin because they're blocked from reading their own role row.
--
-- The security definer functions (has_role / is_admin) already bypass RLS
-- for internal checks, but the direct SELECT from the client was blocked.
-- Adding a "users can read own role" policy fixes the bootstrap case.

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
