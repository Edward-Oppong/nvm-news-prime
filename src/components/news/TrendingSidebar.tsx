import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';
import { useState } from 'react';

interface TrendingSidebarProps {
  articles: Article[];
}

export function TrendingSidebar({ articles }: TrendingSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-28">
      <motion.div 
        className="bg-surface-elevated rounded-2xl p-6 border border-border/60"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-divider">
          <div className="w-1 h-6 rounded-full bg-accent" />
          <h3 className="font-serif text-xl font-bold text-headline tracking-tight">
            Trending Now
          </h3>
        </div>

        <div className="space-y-0">
          {articles.slice(0, 5).map((article, index) => (
            <TrendingItem key={article.id} article={article} index={index} />
          ))}
        </div>
      </motion.div>
    </aside>
  );
}

function TrendingItem({ article, index }: { article: Article; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/article/${article.id}`}>
      <motion.article
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="group flex gap-4 py-4 border-b border-divider/50 last:border-0 last:pb-0 first:pt-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span 
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center font-serif text-lg font-bold rounded-lg transition-all duration-300 ${
            isHovered 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-sm font-semibold leading-snug text-headline line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5">{article.readTime}</p>
        </div>
      </motion.article>
    </Link>
  );
}
