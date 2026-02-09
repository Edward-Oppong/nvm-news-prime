import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { Button } from '@/components/ui/button';

interface PersonalizedFeedProps {
  articles: Article[];
}

export function PersonalizedFeed({ articles }: PersonalizedFeedProps) {
  const { getCategoryPreferences, wasRead } = useReadingHistory();

  const recommendedArticles = useMemo(() => {
    const preferences = getCategoryPreferences();
    const topCategories = preferences.slice(0, 3).map((p) => p.category);

    if (topCategories.length === 0) {
      return articles.slice(0, 4);
    }

    const scoredArticles = articles
      .filter((article) => !wasRead(article.id))
      .map((article) => {
        const categoryIndex = topCategories.indexOf(article.category);
        let score = 0;
        
        if (categoryIndex !== -1) {
          score += (3 - categoryIndex) * 10;
        }
        
        if (article.breaking) score += 20;
        if (article.featured) score += 15;

        return { article, score };
      })
      .sort((a, b) => b.score - a.score);

    return scoredArticles.slice(0, 4).map((s) => s.article);
  }, [articles, getCategoryPreferences, wasRead]);

  const preferences = getCategoryPreferences();
  const hasPreferences = preferences.length > 0;

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container">
        {/* Section header with enhanced design */}
        <motion.div 
          className="flex items-center justify-between mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 rounded-lg bg-primary/10"
                animate={{ rotate: hasPreferences ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {hasPreferences ? (
                  <Sparkles className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-primary" />
                )}
              </motion.div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-headline">
                {hasPreferences ? 'For You' : 'Trending Now'}
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-divider to-transparent hidden sm:block" />
          </div>
        </motion.div>

        {/* Preference indicators with improved design */}
        {hasPreferences && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10"
          >
            <span className="text-sm text-muted-foreground">Based on your interests:</span>
            <div className="flex flex-wrap gap-2">
              {preferences.slice(0, 3).map((pref, index) => (
                <motion.span 
                  key={pref.category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground capitalize shadow-sm"
                >
                  {pref.category}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Articles grid with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {recommendedArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ArticleCard
                article={article}
                variant="medium"
                index={index}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
