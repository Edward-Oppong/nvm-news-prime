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

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <SectionHeader 
          title="Top Stories"
          icon={TrendingUp}
          accentColor="primary"
        />

        {/* Grid with staggered animation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Featured article */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ArticleCard article={featured} variant="large" index={0} />
          </motion.div>

          {/* Side articles */}
          <motion.div 
            className="lg:col-span-5 space-y-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {gridArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
                index={index + 1}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
