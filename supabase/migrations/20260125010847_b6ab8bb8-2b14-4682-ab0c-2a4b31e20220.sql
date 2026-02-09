-- Fix the SECURITY DEFINER view warning by setting it to SECURITY INVOKER
ALTER VIEW public.authors_public SET (security_invoker = on);