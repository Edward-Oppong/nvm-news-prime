import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { SectionHeader } from './SectionHeader';

interface TopStoriesGridProps {
  articles: Article[];
}

export function TopStoriesGrid({ articles }: TopStoriesGridProps) {
  const [featured, ...rest] = articles;
  const gridArticles = rest.slice(0, 4);

  if (!featured) return null;

  return (
    <section className="py-5 md:py-8 bg-muted/30">
      <div className="container">
        <SectionHeader 
          title="Top Stories"
          accentColor="primary"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Featured article */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ArticleCard article={featured} variant="large" index={0} />
          </motion.div>

          {/* Side articles */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {gridArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <ArticleCard
                  article={article}
                  variant="horizontal"
                  index={index + 1}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
