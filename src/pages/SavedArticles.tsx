import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { ArticleCard } from '@/components/news/ArticleCard';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useArticles } from '@/hooks/useArticles';
import { mockArticles } from '@/data/mockArticles';

export default function SavedArticles() {
  const { savedIds, unsaveArticle } = useSavedArticles();
  const { data: dbArticles } = useArticles();

  const allArticles = useMemo(() => {
    if (dbArticles && dbArticles.length > 0) {
      return [...dbArticles, ...mockArticles.filter(m => !dbArticles.some(a => a.title === m.title))];
    }
    return mockArticles;
  }, [dbArticles]);

  const savedArticles = useMemo(() => {
    return allArticles.filter((article) => savedIds.includes(article.id));
  }, [allArticles, savedIds]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-headline">
              Saved Articles
            </h1>
            <p className="text-muted-foreground mt-1">
              {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {savedArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-headline mb-2">No saved articles yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              When you find articles you want to read later, save them and they'll appear here.
            </p>
            <Button asChild>
              <Link to="/">Explore Articles</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <ArticleCard article={article} variant="medium" index={index} />
                <button
                  onClick={() => unsaveArticle(article.id)}
                  className="absolute top-4 right-4 p-2 bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove from saved"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
