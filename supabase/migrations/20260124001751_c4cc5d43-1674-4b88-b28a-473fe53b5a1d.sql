-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (is_admin());

-- Allow users to unsubscribe via their email (they need to know their email)
CREATE POLICY "Anyone can update their subscription status" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (true);

-- Create saved articles table for bookmark functionality
CREATE TABLE public.saved_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  user_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Enable RLS
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved articles
CREATE POLICY "Users can view their saved articles" 
ON public.saved_articles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can save articles
CREATE POLICY "Users can save articles" 
ON public.saved_articles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can unsave articles
CREATE POLICY "Users can remove saved articles" 
ON public.saved_articles 
FOR DELETE 
USING (auth.uid() = user_id);