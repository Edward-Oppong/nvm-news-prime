import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Clock, X } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { ArticleCard } from '@/components/news/ArticleCard';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { useArticles } from '@/hooks/useArticles';
import { mockArticles } from '@/data/mockArticles';

export default function SearchPage() {
  const { data: dbArticles } = useArticles();
  
  const allArticles = useMemo(() => {
    if (dbArticles && dbArticles.length > 0) {
      return [...dbArticles, ...mockArticles.filter(m => !dbArticles.some(a => a.title === m.title))];
    }
    return mockArticles;
  }, [dbArticles]);

  const { 
    query, 
    setQuery, 
    results, 
    recentSearches, 
    clearRecentSearches 
  } = useSearch({ articles: allArticles });

  const categories = ['Politics', 'Business', 'Tech', 'Culture', 'Sports', 'Opinion'];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="container py-8 md:py-12">
        {/* Search header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles, topics, authors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!query ? (
          <div className="space-y-10">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-headline flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Searches
                  </h2>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 8).map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Browse categories */}
            <section>
              <h2 className="font-semibold text-headline mb-4">Browse Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category.toLowerCase()}`}
                    className="p-6 rounded-xl bg-muted/50 hover:bg-muted text-center transition-colors"
                  >
                    <span className="font-medium text-headline">{category}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Trending topics */}
            <section>
              <h2 className="font-semibold text-headline mb-4">Trending Topics</h2>
              <div className="flex flex-wrap gap-2">
                {['Climate Change', 'AI Technology', 'Elections 2024', 'Stock Market', 'Health & Wellness', 'Space Exploration'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setQuery(topic)}
                    className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary text-sm transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div>
            {/* Results count */}
            <p className="text-muted-foreground mb-6">
              {`${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
            </p>

            {/* Results grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ArticleCard article={article} variant="medium" index={index} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-headline mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or browse our categories
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
