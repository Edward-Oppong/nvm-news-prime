import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Article, Category } from '@/types/news';
import { format } from 'date-fns';

// Database article with relations
interface DBArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  read_time: string | null;
  featured: boolean | null;
  breaking: boolean | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
  view_count: number | null;
  categories: { slug: string; name: string; color: string | null } | null;
  authors_public: { name: string; avatar_url: string | null } | null;
}

// Transform database article to frontend Article type
function transformArticle(dbArticle: DBArticle): Article {
  const publishDate = dbArticle.published_at || dbArticle.created_at;

  return {
    id: dbArticle.id,
    title: dbArticle.title,
    excerpt: dbArticle.excerpt || '',
    content: dbArticle.content || undefined,
    slug: dbArticle.slug,
    category: (dbArticle.categories?.slug || 'general') as Category,
    categoryLabel: dbArticle.categories?.name || 'General',
    categoryColor: dbArticle.categories?.color || 'category-general',
    author: dbArticle.authors_public?.name || 'Unknown Author',
    date: format(new Date(publishDate), 'MMMM d, yyyy'),
    readTime: dbArticle.read_time || '5 min read',
    image: dbArticle.image_url || '/placeholder.svg',
    featured: dbArticle.featured || false,
    breaking: dbArticle.breaking || false,
    videoUrl: dbArticle.video_url || undefined,
    viewCount: dbArticle.view_count || 0,
  };
}

// Fetch published articles for Homepage (0 to 2 weeks old / <= 14 days)
export function useArticles() {
  return useQuery({
    queryKey: ['articles', 'homepage-14days'],
    queryFn: async () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const isoCutoff = fourteenDaysAgo.toISOString();

      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .gte('created_at', isoCutoff)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // If database has very few/no articles within 14 days, return what we have (or fallback if empty to ensure initial experience is smooth)
      const transformed = (data as DBArticle[]).map(transformArticle);
      if (transformed.length > 0) {
        return transformed;
      }

      // Fallback query if no articles in last 14 days exist yet
      const { data: fallbackData } = await supabase
        .from('articles')
        .select(`
          id, slug, title, excerpt, content, image_url, video_url, read_time, featured, breaking, published, published_at, created_at, view_count,
          categories (slug, name, color), authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(10);

      return (fallbackData as DBArticle[] || []).map(transformArticle);
    },
  });
}

// Fetch featured article
export function useFeaturedArticle() {
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return transformArticle(data as DBArticle);
    },
  });
}

// Fetch articles by category (up to 1 month old / <= 30 days)
export function useArticlesByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['articles', 'category', categorySlug],
    queryFn: async () => {
      // First get the category ID
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (catError) throw catError;
      if (!category) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoCutoff = thirtyDaysAgo.toISOString();

      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .eq('category_id', category.id)
        .gte('created_at', isoCutoff)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data as DBArticle[]).map(transformArticle);
    },
    enabled: !!categorySlug,
  });
}

// Fetch single article by ID
export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return transformArticle(data as DBArticle);
    },
    enabled: !!id,
  });
}

// Fetch related articles (same category, excluding current)
export function useRelatedArticles(articleId: string, category: Category) {
  return useQuery({
    queryKey: ['related-articles', articleId, category],
    queryFn: async () => {
      // Get category ID
      const { data: cat, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .maybeSingle();

      if (catError) throw catError;
      if (!cat) return [];

      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .eq('category_id', cat.id)
        .neq('id', articleId)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data as DBArticle[]).map(transformArticle);
    },
    enabled: !!articleId && !!category,
  });
}

// Fetch video articles (articles with video_url)
export function useVideoArticles() {
  return useQuery({
    queryKey: ['video-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .not('video_url', 'is', null)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data as DBArticle[]).map(transformArticle);
    },
  });
}

// Fetch single article by slug (used by the public article page)
export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return transformArticle(data as DBArticle);
    },
    enabled: !!slug,
  });
}

// Fetch trending articles (most recent from various categories)
export function useTrendingArticles(limit = 5) {
  return useQuery({
    queryKey: ['trending-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          image_url,
          video_url,
          read_time,
          featured,
          breaking,
          published,
          published_at,
          created_at,
          view_count,
          categories (slug, name, color),
          authors_public (name, avatar_url)
        `)
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as DBArticle[]).map(transformArticle);
    },
  });
}