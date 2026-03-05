import { motion } from 'framer-motion';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';
import { SectionHeader } from './SectionHeader';

interface CategoryNewsSectionProps {
  title: string;
  articles: Article[];
  accentColor?: 'primary' | 'accent' | 'breaking' | 'category-general' | 'category-entertainment' | 'category-politics' | 'category-sports' | 'category-business';
  linkHref?: string;
}

export function CategoryNewsSection({ 
  title, 
  articles, 
  accentColor = 'primary',
  linkHref 
}: CategoryNewsSectionProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const sideArticles = rest.slice(0, 3);

  return (
    <section className="py-4 md:py-8">
      <div className="container px-3 md:px-4 lg:px-6">
        <SectionHeader 
          title={title}
          accentColor={accentColor}
          linkText="See all"
          linkHref={linkHref}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Lead article */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <ArticleCard article={lead} variant="large" index={0} />
          </motion.div>

          {/* Side articles — stacked */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-divider">
            {sideArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <ArticleCard article={article} variant="horizontal" index={index + 1} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
