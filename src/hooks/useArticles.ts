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
  audio_url?: string | null;
  read_time: string | null;
  featured: boolean | null;
  breaking: boolean | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
  view_count: number | null;
  reviewed_by?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  // Three-tier byline hierarchy
  writer_name?: string | null;
  author_name?: string | null;
  publisher_name?: string | null;
  title_font_size?: string | null;
  categories: { slug: string; name: string; color: string | null } | null;
  authors?: { name: string; avatar_url: string | null } | null;
  authors_public?: { name: string; avatar_url: string | null } | null;
  reviewer?: { name: string; avatar_url: string | null } | null;
}

// Format date safely in UTC / Ghana standard time
function formatArticleDate(dateStr?: string | null): string {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(d);
  } catch {
    return 'Recently';
  }
}

// Transform database article to frontend Article type
function transformArticle(dbArticle: DBArticle): Article {
  const publishDate = dbArticle.published_at || dbArticle.created_at;

  const authorObj = dbArticle.authors || dbArticle.authors_public;
  const authorName = authorObj?.name || 'Staff Writer';
  const authorAvatar = authorObj?.avatar_url || undefined;

  const reviewerName = dbArticle.reviewer?.name || dbArticle.reviewed_by_name || (dbArticle.published ? 'Editorial Admin' : undefined);
  const reviewerAvatar = dbArticle.reviewer?.avatar_url || undefined;
  const reviewerRole = 'Editorial Administrator';

  return {
    id: dbArticle.id,
    title: dbArticle.title,
    excerpt: dbArticle.excerpt || '',
    content: dbArticle.content || undefined,
    slug: dbArticle.slug,
    category: (dbArticle.categories?.slug || 'general') as Category,
    categoryLabel: dbArticle.categories?.name || 'General',
    categoryColor: dbArticle.categories?.color || 'category-general',
    author: authorName,
    authorAvatar: authorAvatar,
    // Three-tier byline hierarchy
    writerName: dbArticle.writer_name || undefined,
    authorName: dbArticle.author_name || undefined,
    publisherName: dbArticle.publisher_name || undefined,
    titleFontSize: dbArticle.title_font_size || 'text-4xl',
    reviewedBy: dbArticle.published ? reviewerName : undefined,
    reviewedByRole: dbArticle.published ? reviewerRole : undefined,
    reviewedByAvatar: dbArticle.published ? reviewerAvatar : undefined,
    reviewedAt: dbArticle.reviewed_at ? formatArticleDate(dbArticle.reviewed_at) : undefined,
    date: formatArticleDate(publishDate),
    readTime: dbArticle.read_time || '5 min read',
    image: dbArticle.image_url || '/placeholder.svg',
    featured: dbArticle.featured || false,
    breaking: dbArticle.breaking || false,
    videoUrl: dbArticle.video_url || undefined,
    audioUrl: dbArticle.audio_url || undefined,
    viewCount: dbArticle.view_count || 0,
  };
}

/**
  * Safely execute article queries.
  * Tries selecting full schema fields (including audio_url and reviewed_by columns).
  * If the remote Supabase database has not migrated these columns yet (SQL error 42703),
  * it automatically falls back to core fields so published articles always render cleanly.
  */
async function fetchArticlesQuery(buildQuery: (selectStr: string) => any) {
  const FULL_FIELDS = `
    id, slug, title, excerpt, content, image_url, video_url, audio_url, read_time,
    featured, breaking, published, published_at, created_at, view_count,
    reviewed_by, reviewed_by_name, reviewed_at,
    writer_name, author_name, publisher_name, title_font_size,
    categories (slug, name, color), authors (name, avatar_url)
  `;

  const CORE_FIELDS = `
    id, slug, title, excerpt, content, image_url, video_url, read_time,
    featured, breaking, published, published_at, created_at, view_count,
    categories (slug, name, color), authors (name, avatar_url)
  `;

  let { data, error } = await buildQuery(FULL_FIELDS);

  if (error && (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    (error.message && (
      error.message.includes('column') ||
      error.message.includes('audio_url') ||
      error.message.includes('reviewed')
    ))
  )) {
    console.warn('Falling back to core article fields due to remote DB schema:', error.message);
    const fallbackRes = await buildQuery(CORE_FIELDS);
    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error) {
    console.error('Failed to fetch articles:', error);
    throw error;
  }

  return data;
}

// Fetch published articles for Homepage
export function useArticles() {
  return useQuery({
    queryKey: ['articles', 'homepage'],
    queryFn: async () => {
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .order('published_at', { ascending: false, nullsFirst: false })
      );
      return (data as DBArticle[] || []).map(transformArticle);
    },
  });
}

// Fetch featured article
export function useFeaturedArticle() {
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: async () => {
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      );
      if (!data) return null;
      return transformArticle(data as DBArticle);
    },
  });
}

// Fetch articles by category
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

      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .eq('category_id', category.id)
          .order('published_at', { ascending: false, nullsFirst: false })
      );
      return (data as DBArticle[] || []).map(transformArticle);
    },
    enabled: !!categorySlug,
  });
}

// Fetch single article by ID
export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('id', id)
          .maybeSingle()
      );
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

      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .eq('category_id', cat.id)
          .neq('id', articleId)
          .order('published_at', { ascending: false })
          .limit(3)
      );
      return (data as DBArticle[] || []).map(transformArticle);
    },
    enabled: !!articleId && !!category,
  });
}

// Fetch video articles (articles with video_url)
export function useVideoArticles() {
  return useQuery({
    queryKey: ['video-articles'],
    queryFn: async () => {
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .not('video_url', 'is', null)
          .order('published_at', { ascending: false, nullsFirst: false })
      );
      return (data as DBArticle[] || []).map(transformArticle);
    },
  });
}

// Fetch single article by slug (used by the public article page)
export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', 'slug', slug],
    queryFn: async () => {
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle()
      );
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
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(limit)
      );
      return (data as DBArticle[] || []).map(transformArticle);
    },
  });
}