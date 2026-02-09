import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, X } from 'lucide-react';
import { Article } from '@/types/news';

interface BreakingNewsTickerProps {
  articles: Article[];
}

export function BreakingNewsTicker({ articles }: BreakingNewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const breakingArticles = articles.filter(a => a.breaking);

  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [breakingArticles.length]);

  if (!breakingArticles.length || !isVisible) return null;

  const currentArticle = breakingArticles[currentIndex];

  return (
    <motion.div 
      className="bg-gradient-to-r from-breaking via-breaking to-breaking/95 text-breaking-foreground py-2.5 relative overflow-hidden"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background pulse */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-white/5"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="container flex items-center gap-4 relative z-10">
        {/* Live indicator with enhanced animation */}
        <motion.div 
          className="flex items-center gap-2 flex-shrink-0 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest">Breaking</span>
        </motion.div>

        {/* Scrolling news with improved animation */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentArticle.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4 flex-shrink-0 fill-current" />
              <Link 
                to={`/article/${currentArticle.id}`}
                className="text-sm font-semibold truncate hover:underline underline-offset-2"
              >
                {currentArticle.title}
              </Link>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination dots with animation */}
        {breakingArticles.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            {breakingArticles.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5 hover:bg-white/60'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}

        {/* Close button with hover effect */}
        <motion.button 
          onClick={() => setIsVisible(false)}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
          aria-label="Close breaking news"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
