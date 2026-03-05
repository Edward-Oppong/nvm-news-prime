import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';

interface HeroSectionProps {
  articles: Article[];
}

export function HeroSection({ articles }: HeroSectionProps) {
  const [hero, ...rest] = articles;
  const secondary = rest.slice(0, 2);

  if (!hero) return null;

  return (
    <section className="py-4 md:py-8">
      <div className="container px-3 md:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-3">
          {/* Hero main story */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={`/article/${hero.id}`}
              className="group block relative overflow-hidden rounded-xl aspect-[16/10] lg:aspect-[4/3] lg:h-full"
            >
              <img
                src={hero.image}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <CategoryBadge category={hero.category} />
                  {hero.breaking && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-breaking text-breaking-foreground">
                      Breaking
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-lg md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-1 md:mb-2 tracking-tight">
                  {hero.title}
                </h1>
                <p className="text-white/70 text-xs md:text-sm line-clamp-2 mb-1.5 md:mb-2 max-w-lg hidden sm:block">
                  {hero.excerpt}
                </p>
                <div className="flex items-center gap-2 md:gap-3 text-white/50 text-[10px] md:text-xs">
                  <span className="font-medium text-white/75">{hero.author}</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {hero.readTime}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span>{hero.date}</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary stories — right column */}
          <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
            {secondary.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="flex-1"
              >
                <Link
                  to={`/article/${article.id}`}
                  className="group block relative overflow-hidden rounded-xl h-full min-h-[160px]"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <CategoryBadge category={article.category} className="mb-1.5 !text-[10px]" />
                    <h2 className="font-serif text-sm md:text-base font-semibold text-white leading-snug line-clamp-2 mb-1">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <span>{article.author}</span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
