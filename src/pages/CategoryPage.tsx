import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { ArticleCard } from '@/components/news/ArticleCard';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { useArticlesByCategory } from '@/hooks/useArticles';
import { categoryConfigs } from '@/data/categoryConfig';
import { Category } from '@/types/news';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const categoryKey = category as Category;
  const config = categoryConfigs[categoryKey];

  const { data: dbArticles, isLoading } = useArticlesByCategory(categoryKey);
  const articles = dbArticles ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [categoryDescription, setCategoryDescription] = useState<string | null>(null);

  useEffect(() => {
    setSearchQuery('');
  }, [categoryKey]);

  useEffect(() => {
    if (!categoryKey) return;
    supabase
      .from('categories')
      .select('hero_image_url, description')
      .eq('slug', categoryKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.hero_image_url) setHeroImageUrl(data.hero_image_url);
        if (data?.description) setCategoryDescription(data.description);
      });
  }, [categoryKey]);

  const bannerSrc = heroImageUrl || config?.banner;
  const description = categoryDescription || config?.description;

  // Filter articles based on search query
  const filteredArticles = articles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query)
    );
  });

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="headline-xl mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title={`${config.name} News`}
        description={description || `Latest ${config.name} news, updates and analysis from NVM News.`}
        image={bannerSrc}
        section={config.name}
      />
      <Header />

      <main>
        {/* Category Hero Banner */}
        <section className="relative h-[40vh] md:h-[50vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={bannerSrc}
              alt={config.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          <div className="relative container pb-10 md:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {config.name}
              </h1>

              <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                {description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Articles Section & Category Search */}
        <section className="py-8 md:py-12">
          <div className="container">
            {/* Search Bar & Count Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-lg text-foreground">{filteredArticles.length}</span>
                <span>{filteredArticles.length === 1 ? 'story' : 'stories'} from the past 30 days</span>
              </div>

              <div className="relative max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Search ${config.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 rounded-full border-border bg-card shadow-sm text-sm focus-visible:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : filteredArticles.length > 0 ? (
              <>
                {filteredArticles[0] && (
                  <div className="mb-12">
                    <ArticleCard article={filteredArticles[0]} variant="large" index={0} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.slice(1).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="medium"
                      index={index + 1}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  {searchQuery ? `No stories matching "${searchQuery}"` : 'No articles in this category within the past 30 days.'}
                </p>
                <Link to="/" className="text-primary hover:underline">← Browse recent stories on home</Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
