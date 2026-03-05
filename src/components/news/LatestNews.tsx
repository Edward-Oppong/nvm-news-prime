import { motion } from 'framer-motion';
import { Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { TrendingSidebar } from './TrendingSidebar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';

interface LatestNewsProps {
  articles: Article[];
  trending: Article[];
}

export function LatestNews({ articles, trending }: LatestNewsProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 6, articles.length));
      setIsLoading(false);
    }, 400);
  };

  const hasMore = visibleCount < articles.length;

  return (
    <section className="py-4 md:py-8">
      <div className="container px-3 md:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Main content */}
          <div className="lg:col-span-8">
            <SectionHeader 
              title="Latest News"
              accentColor="accent"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {articles.slice(0, visibleCount).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.06, duration: 0.4 }}
                >
                  <ArticleCard
                    article={article}
                    variant="medium"
                    index={index}
                  />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <motion.div 
                className="mt-5 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="group min-w-[200px] border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300 rounded-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <TrendingSidebar articles={trending} />
          </div>
        </div>
      </div>
    </section>
  );
}
