import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';

interface FeaturedGridProps {
  articles: Article[];
}

export function FeaturedGrid({ articles }: FeaturedGridProps) {
  const [main, ...side] = articles;
  const sideArticles = side.slice(0, 4);

  if (!main) return null;

  return (
    <section className="pt-3 pb-4 md:pt-4 md:pb-6">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3">
          {/* Main featured article */}
          <motion.div 
            className="lg:col-span-7 lg:row-span-2"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to={`/article/${main.id}`}
              className="group block relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px] lg:min-h-[380px]"
            >
              <img 
                src={main.image} 
                alt={main.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 lg:p-8">
                <CategoryBadge category={main.category} className="mb-2" />
                <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-white leading-[1.15] mb-2 tracking-tight">
                  {main.title}
                </h2>
                <p className="text-white/70 text-sm line-clamp-2 mb-3 max-w-xl">
                  {main.excerpt}
                </p>
                <div className="flex items-center gap-3 text-white/50 text-sm">
                  <span className="font-medium text-white/80">{main.author}</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {main.readTime}
                  </span>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side articles - 2x2 grid */}
          {sideArticles.map((article, index) => (
            <motion.div
              key={article.id}
              className="lg:col-span-5 lg:col-start-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }}
            >
              <Link 
                to={`/article/${article.id}`}
                className="group flex gap-3 items-center p-2 rounded-xl hover:bg-muted/60 transition-all duration-300"
              >
                <div className="relative flex-shrink-0 w-28 h-20 md:w-32 md:h-24 rounded-lg overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CategoryBadge category={article.category} className="mb-1.5 !text-[10px]" />
                  <h3 className="font-serif text-sm md:text-base font-semibold leading-snug line-clamp-2 text-headline group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5">{article.date}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
