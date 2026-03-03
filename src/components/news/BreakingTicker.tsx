import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';

interface BreakingTickerProps {
  articles: Article[];
}

export function BreakingTicker({ articles }: BreakingTickerProps) {
  const breakingArticles = articles.filter(a => a.breaking);
  const tickerItems = breakingArticles.length > 0 ? breakingArticles : articles.slice(0, 3);

  if (tickerItems.length === 0) return null;

  const tickerText = tickerItems.map(a => a.title).join('  •  ');
  const doubled = `${tickerText}  •  ${tickerText}`;

  return (
    <div className="bg-breaking text-breaking-foreground overflow-hidden">
      <div className="container flex items-center gap-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-breaking font-bold text-xs uppercase tracking-wider flex-shrink-0 z-10">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Breaking</span>
        </div>
        <div className="overflow-hidden flex-1 py-1.5">
          <motion.div
            className="whitespace-nowrap text-sm font-medium"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: tickerItems.length * 12, repeat: Infinity, ease: 'linear' }}
          >
            {tickerItems.map((article, i) => (
              <span key={article.id}>
                <Link
                  to={`/article/${article.id}`}
                  className="hover:underline underline-offset-2"
                >
                  {article.title}
                </Link>
                {i < tickerItems.length * 2 - 1 && (
                  <span className="mx-4 opacity-50">•</span>
                )}
              </span>
            ))}
            {tickerItems.map((article, i) => (
              <span key={`dup-${article.id}`}>
                <Link
                  to={`/article/${article.id}`}
                  className="hover:underline underline-offset-2"
                >
                  {article.title}
                </Link>
                {i < tickerItems.length - 1 && (
                  <span className="mx-4 opacity-50">•</span>
                )}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
