import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { Article } from '@/types/news';

interface QuickLinksBarProps {
  articles: Article[];
}

const quickLinks = [
  { name: 'Campus News', href: '/category/politics' },
  { name: 'Lifestyle', href: '/category/culture' },
  { name: 'Education', href: '/category/business' },
  { name: 'Sports', href: '/category/sports' },
];

export function QuickLinksBar({ articles }: QuickLinksBarProps) {
  // Get the latest breaking or featured article for the ticker
  const hotArticle = articles.find(a => a.breaking) || articles[0];

  return (
    <div className="bg-muted/50 border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between py-2 gap-4">
          {/* Hot News Ticker */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-breaking shrink-0">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Hot News</span>
            </div>
            
            {hotArticle && (
              <motion.div 
                className="flex-1 min-w-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link 
                  to={`/article/${hotArticle.id}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="truncate">{hotArticle.title}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Quick Links */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Quick Links:</span>
            {quickLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
