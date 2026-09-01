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

// Fetch articles by category — with double fallback for slug-based matching
export function useArticlesByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['articles', 'category', categorySlug],
    queryFn: async () => {
      // Primary: try category_id join lookup
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (category?.id) {
        const data = await fetchArticlesQuery((selectStr) =>
          supabase
            .from('articles')
            .select(selectStr)
            .eq('published', true)
            .eq('category_id', category.id)
            .order('published_at', { ascending: false, nullsFirst: false })
        );
        const results = (data as DBArticle[] || []).map(transformArticle);
        // If we got results, return them
        if (results.length > 0) return results;
      }

      // Fallback: fetch all published articles and filter by category slug client-side
      // This handles cases where category_id FK is null or slug mismatches
      const allData = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .order('published_at', { ascending: false, nullsFirst: false })
      );
      const allArticles = (allData as DBArticle[] || []).map(transformArticle);
      return allArticles.filter(
        (a) => a.category.toLowerCase() === categorySlug.toLowerCase()
      );
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
export function useRelatedArticles(articleId: string, category: string) {
  return useQuery({
    queryKey: ['related-articles', articleId, category],
    queryFn: async () => {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .maybeSingle();

      if (!cat?.id) {
        // Fallback: return most recent excluding current article
        const data = await fetchArticlesQuery((selectStr) =>
          supabase
            .from('articles')
            .select(selectStr)
            .eq('published', true)
            .neq('id', articleId)
            .order('published_at', { ascending: false })
            .limit(3)
        );
        return (data as DBArticle[] || []).map(transformArticle);
      }

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
      const results = (data as DBArticle[] || []).map(transformArticle);
      // Fallback if same-category returns empty
      if (results.length === 0) {
        const fallback = await fetchArticlesQuery((selectStr) =>
          supabase
            .from('articles')
            .select(selectStr)
            .eq('published', true)
            .neq('id', articleId)
            .order('published_at', { ascending: false })
            .limit(3)
        );
        return (fallback as DBArticle[] || []).map(transformArticle);
      }
      return results;
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

// ─── Smart Trending Algorithm ───────────────────────────────────────────────
// Scores articles using engagement velocity, recency decay, category diversity,
// and editorial bonuses for breaking/featured articles.
function computeTrendScore(article: Article): number {
  const now = Date.now();
  const publishedAt = article.date ? new Date(article.date).getTime() : now;
  const ageMs = Math.max(now - publishedAt, 1);
  const hoursOld = ageMs / (1000 * 60 * 60);

  // Only articles from last 48 hours are eligible
  if (hoursOld > 48) return 0;

  const viewCount = article.viewCount || 0;

  // ViewVelocity: views per hour since publish (higher = trending faster)
  const viewVelocity = viewCount / Math.max(hoursOld, 0.5);

  // Recency bonus: articles less than 6 hours old get a strong boost
  const recencyBonus = hoursOld < 6 ? (6 - hoursOld) * 8 : 0;

  // Decay penalty: older articles get progressively penalised
  const decayPenalty = hoursOld * 1.5;

  // Editorial bonuses
  const breakingBonus = article.breaking ? 20 : 0;
  const featuredBonus = article.featured ? 10 : 0;

  const score =
    viewVelocity * 3 +
    viewCount * 0.5 +
    recencyBonus +
    breakingBonus +
    featuredBonus -
    decayPenalty;

  return Math.max(score, 0);
}

function diversifyByCategory(articles: Article[], limit: number, maxPerCategory = 2): Article[] {
  const categoryCounts: Record<string, number> = {};
  const result: Article[] = [];

  for (const article of articles) {
    const cat = article.category;
    const count = categoryCounts[cat] || 0;
    if (count < maxPerCategory) {
      result.push(article);
      categoryCounts[cat] = count + 1;
    }
    if (result.length >= limit) break;
  }

  // If we didn't get enough diverse articles, fill remaining slots with any article
  if (result.length < limit) {
    for (const article of articles) {
      if (!result.find((r) => r.id === article.id)) {
        result.push(article);
      }
      if (result.length >= limit) break;
    }
  }

  return result;
}

export function useTrendingArticles(limit = 5) {
  return useQuery({
    queryKey: ['trending-articles', limit],
    queryFn: async () => {
      // Fetch a broader pool: last 48h of published articles (up to 40)
      // to give the algorithm enough candidates
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const data = await fetchArticlesQuery((selectStr) =>
        supabase
          .from('articles')
          .select(selectStr)
          .eq('published', true)
          .gte('published_at', cutoff)
          .order('view_count', { ascending: false })
          .limit(40)
      );

      const candidates = (data as DBArticle[] || []).map(transformArticle);

      // If no recent articles, fall back to latest regardless of age
      if (candidates.length === 0) {
        const fallback = await fetchArticlesQuery((selectStr) =>
          supabase
            .from('articles')
            .select(selectStr)
            .eq('published', true)
            .order('published_at', { ascending: false })
            .limit(limit)
        );
        return (fallback as DBArticle[] || []).map(transformArticle);
      }

      // Score & sort
      const scored = candidates
        .map((article) => ({ article, score: computeTrendScore(article) }))
        .sort((a, b) => b.score - a.score)
        .map(({ article }) => article);

      // Apply category diversity (max 2 per category) then trim to limit
      return diversifyByCategory(scored, limit, 2);
    },
  });
}