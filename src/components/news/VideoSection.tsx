import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';

interface VideoSectionProps {
  articles: Article[];
}

export function VideoSection({ articles }: VideoSectionProps) {
  const videoArticles = articles.slice(0, 4);

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-5 w-5 text-primary fill-current" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-headline">
              Watch
            </h2>
          </div>
          <div className="h-px flex-1 bg-divider ml-6" />
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group"
            >
              <Link to={`/article/${article.id}`} className="block relative">
                <div className="aspect-video rounded-lg overflow-hidden mb-3">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="h-6 w-6 text-headline fill-current ml-1" />
                    </div>
                  </div>
                  {/* Duration */}
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
                    {article.readTime.replace(' read', '')}
                  </span>
                </div>
              </Link>
              <CategoryBadge category={article.category} className="mb-2" />
              <h3 className="font-serif text-lg font-medium leading-snug text-headline line-clamp-2 group-hover:text-primary transition-colors">
                <Link to={`/article/${article.id}`}>
                  {article.title}
                </Link>
              </h3>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
