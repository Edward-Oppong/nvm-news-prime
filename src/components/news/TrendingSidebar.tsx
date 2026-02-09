import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, ArrowUpRight } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';
import { useState } from 'react';

interface TrendingSidebarProps {
  articles: Article[];
}

export function TrendingSidebar({ articles }: TrendingSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-28">
      {/* Trending section */}
      <motion.div 
        className="bg-surface-elevated rounded-2xl p-6 shadow-card border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-headline">
            Trending Now
          </h3>
        </div>

        <div className="space-y-0">
          {articles.slice(0, 5).map((article, index) => (
            <TrendingItem key={article.id} article={article} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Mobile horizontal scroll */}
      <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide mt-6">
        <div className="flex gap-4 pb-4">
          {articles.slice(0, 5).map((article, index) => (
            <MobileTrendingCard key={article.id} article={article} index={index} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function TrendingItem({ article, index }: { article: Article; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group flex gap-4 py-4 border-b border-divider last:border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span 
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center font-serif text-2xl font-bold rounded-lg transition-all duration-300"
        animate={{ 
          backgroundColor: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.1)',
          color: isHovered ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary))'
        }}
      >
        {index + 1}
      </motion.span>
      <div className="flex-1 min-w-0">
        <CategoryBadge category={article.category} className="mb-1.5 text-[10px]" />
        <h4 className="font-serif text-base font-medium leading-snug text-headline line-clamp-2 group-hover:text-primary transition-colors">
          <Link to={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h4>
        <p className="text-xs text-muted-foreground mt-1">{article.readTime}</p>
      </div>
      <motion.div
        className="hidden md:flex items-start pt-1"
        animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
      >
        <ArrowUpRight className="h-4 w-4 text-primary" />
      </motion.div>
    </motion.article>
  );
}

function MobileTrendingCard({ article, index }: { article: Article; index: number }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Link
      to={`/article/${article.id}`}
      className="flex-shrink-0 w-64 group"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="aspect-[16/10] rounded-xl overflow-hidden mb-2 relative shadow-sm">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-muted skeleton-shimmer" />
          )}
          <img
            src={article.image}
            alt={article.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        <CategoryBadge category={article.category} className="mb-1 text-[10px]" />
        <h4 className="font-serif text-sm font-medium leading-snug text-headline line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h4>
      </motion.div>
    </Link>
  );
}
