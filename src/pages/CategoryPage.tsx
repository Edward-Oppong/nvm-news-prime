import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { ArticleCard } from '@/components/news/ArticleCard';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { useArticlesByCategory } from '@/hooks/useArticles';
import { getArticlesByCategory as getMockArticles } from '@/data/mockArticles';
import { categoryConfigs } from '@/data/categoryConfig';
import { Category } from '@/types/news';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  
  const categoryKey = category as Category;
  const config = categoryConfigs[categoryKey];
  
  const { data: dbArticles, isLoading } = useArticlesByCategory(categoryKey);
  
  // Combine database articles with mock data for richer content display
  const mockArticles = getMockArticles(categoryKey);
  // Show DB articles first, then fill with mock data to ensure good content coverage
  const articles = dbArticles && dbArticles.length > 0 
    ? [...dbArticles, ...mockArticles.filter(m => !dbArticles.some(d => d.title === m.title))]
    : mockArticles;

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="headline-xl mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main>
        {/* Category Hero Banner */}
        <section className="relative h-[40vh] md:h-[50vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={config.banner}
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
              {/* Breadcrumb */}
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>

              {/* Category name */}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {config.name}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                {config.description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12 md:py-16">
          <div className="container">
            {/* Article count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{articles.length}</span> articles
              </p>
              <div className="h-px flex-1 bg-divider ml-6" />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                {/* Featured article */}
                {articles[0] && (
                  <div className="mb-12">
                    <ArticleCard article={articles[0]} variant="large" index={0} />
                  </div>
                )}

                {/* Rest of articles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.slice(1).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="medium"
                      index={index + 1}
                    />
                  ))}
                </div>

                {/* Load more button */}
                {articles.length > 6 && (
                  <div className="mt-12 text-center">
                    <button className="inline-flex items-center px-8 py-3 border border-foreground text-foreground font-medium rounded-lg hover:bg-foreground hover:text-background transition-colors">
                      Load More Stories
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  No articles in this category yet.
                </p>
                <Link to="/" className="text-primary hover:underline">
                  ← Browse all stories
                </Link>
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
