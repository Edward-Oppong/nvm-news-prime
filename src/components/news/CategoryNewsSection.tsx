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
    <section className="py-5 md:py-6">
      <div className="container">
        <SectionHeader 
          title={title}
          accentColor={accentColor}
          linkText="See all"
          linkHref={linkHref}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Lead article — larger */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ArticleCard article={lead} variant="large" index={0} />
          </motion.div>

          {/* Side articles — stacked list */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            {sideArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
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
