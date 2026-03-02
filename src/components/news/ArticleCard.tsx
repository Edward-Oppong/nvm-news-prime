import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';
import { useState } from 'react';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'horizontal' | 'compact';
  index?: number;
}

export function ArticleCard({ article, variant = 'medium', index = 0 }: ArticleCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const ImageSkeleton = () => (
    <div className="absolute inset-0 bg-muted skeleton-shimmer" />
  );

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="group flex gap-4 py-4 border-b border-divider last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors touch-feedback"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.id}`} className="flex-shrink-0 relative overflow-hidden rounded-lg">
          <div className="w-24 h-24 md:w-28 md:h-24 rounded-lg overflow-hidden">
            {!isImageLoaded && <ImageSkeleton />}
            <motion.img
              src={article.image}
              alt={article.title}
              className={`w-full h-full object-cover transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.4 }}
              loading="lazy"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <CategoryBadge category={article.category} className="mb-1.5" />
          <h3 className="font-serif text-base md:text-lg font-medium leading-snug line-clamp-2 mb-1 transition-colors group-hover:text-primary">
            <Link to={`/article/${article.id}`}>{article.title}</Link>
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{article.date}</span>
          </div>
        </div>
        <motion.div 
          className="hidden md:flex items-center"
          animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
        >
          <ArrowUpRight className="h-5 w-5 text-primary" />
        </motion.div>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="group touch-feedback"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.id}`} className="relative block overflow-hidden">
          <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-300">
            {!isImageLoaded && <ImageSkeleton />}
            <motion.img
              src={article.image}
              alt={article.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.5 }}
              loading="lazy"
            />
          </div>
        </Link>
        <h3 className="font-serif text-sm md:text-base font-medium line-clamp-2 mb-1 transition-colors group-hover:text-primary leading-snug">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="text-xs text-muted-foreground">{article.date}</p>
      </motion.article>
    );
  }

  if (variant === 'small') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="group touch-feedback"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.id}`} className="relative block overflow-hidden">
          <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
            {!isImageLoaded && <ImageSkeleton />}
            <motion.img
              src={article.image}
              alt={article.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.5 }}
              loading="lazy"
            />
          </div>
        </Link>
        <CategoryBadge category={article.category} className="mb-2" />
        <h3 className="font-serif text-base md:text-lg font-medium line-clamp-2 mb-2 transition-colors group-hover:text-primary">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground">{article.date}</p>
      </motion.article>
    );
  }

  if (variant === 'large') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.id}`} className="relative block overflow-hidden">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-3 shadow-card group-hover:shadow-lg transition-all duration-500">
            {!isImageLoaded && <ImageSkeleton />}
            <motion.img
              src={article.image}
              alt={article.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              animate={{ scale: isHovered ? 1.03 : 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              loading="lazy"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </Link>
        <CategoryBadge category={article.category} className="mb-2" />
        <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2 transition-colors group-hover:text-primary leading-tight">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="text-muted-foreground line-clamp-2 mb-3 text-sm">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{article.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime}
          </span>
        </div>
      </motion.article>
    );
  }

  // Medium (default)
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group touch-feedback"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/article/${article.id}`} className="relative block overflow-hidden">
        <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 shadow-card group-hover:shadow-lg transition-all duration-400">
          {!isImageLoaded && <ImageSkeleton />}
          <motion.img
            src={article.image}
            alt={article.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
          />
        </div>
      </Link>
      <CategoryBadge category={article.category} className="mb-1.5" />
      <h3 className="font-serif text-base md:text-lg font-medium line-clamp-2 mb-1.5 transition-colors group-hover:text-primary leading-snug">
        <Link to={`/article/${article.id}`}>{article.title}</Link>
      </h3>
      <p className="text-muted-foreground line-clamp-2 mb-2 text-sm">{article.excerpt}</p>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{article.author}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime}
        </span>
      </div>
    </motion.article>
  );
}
