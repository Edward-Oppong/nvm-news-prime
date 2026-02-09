import { motion } from 'framer-motion';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { SectionHeader } from './SectionHeader';
import { Newspaper } from 'lucide-react';

interface CategoryNewsSectionProps {
  title: string;
  articles: Article[];
  accentColor?: 'primary' | 'accent' | 'breaking' | 'category-politics' | 'category-business' | 'category-tech' | 'category-culture' | 'category-sports' | 'category-opinion';
  linkHref?: string;
}

export function CategoryNewsSection({ 
  title, 
  articles, 
  accentColor = 'primary',
  linkHref 
}: CategoryNewsSectionProps) {
  const displayArticles = articles.slice(0, 4);

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <SectionHeader 
          title={title}
          icon={Newspaper}
          accentColor={accentColor}
          linkText="Read More"
          linkHref={linkHref}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <ArticleCard article={article} variant="compact" index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
