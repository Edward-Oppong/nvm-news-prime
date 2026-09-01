import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight, Eye, User } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';
import { useState } from 'react';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'horizontal' | 'compact';
  index?: number;
}

/** Avatar with blur-up loading and incognito silhouette fallback */
function AuthorAvatar({ src, alt, className = 'w-6 h-6' }: { src?: string | null; alt?: string; className?: string }) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (src && !err) {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-muted/40 relative shrink-0`}>
        {/* Blur placeholder until loaded */}
        {!loaded && (
          <div className="absolute inset-0 bg-muted/60 animate-pulse rounded-full" />
        )}
        <img
          src={src}
          alt={alt || 'Author'}
          onError={() => setErr(true)}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover rounded-full border border-border/50 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    );
  }

  // Incognito silhouette
  return (
    <div className={`${className} rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/50 shrink-0`} title={alt}>
      <User className="w-3/5 h-3/5 text-slate-400" strokeWidth={1.5} />
    </div>
  );
}

/** Lazy image with blur-up shimmer and smooth fade-in */
function LazyImage({
  src,
  alt,
  className = '',
  scale = 1,
}: {
  src: string;
  alt: string;
  className?: string;
  scale?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/80 to-muted/50 animate-pulse" />
      )}
      <motion.img
        src={error ? '/placeholder.svg' : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        animate={{ scale, opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`w-full h-full object-cover ${className}`}
      />
    </>
  );
}

export function ArticleCard({ article, variant = 'medium', index = 0 }: ArticleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="group flex gap-2 py-2 border-b border-divider last:border-0 rounded-lg transition-colors touch-feedback"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.slug}`} className="flex-shrink-0 relative overflow-hidden rounded-lg">
          <div className="w-24 h-24 md:w-28 md:h-24 rounded-lg overflow-hidden bg-muted/30 relative">
            <LazyImage
              src={article.image}
              alt={article.title}
              scale={isHovered ? 1.08 : 1}
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <CategoryBadge label={article.categoryLabel} className="mb-1.5" />
          <h3 className="font-serif text-base md:text-lg font-medium leading-snug line-clamp-2 mb-1 transition-colors group-hover:text-primary">
            <Link to={`/article/${article.slug}`}>{article.title}</Link>
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
        className="group touch-feedback flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.slug}`} className="relative block overflow-hidden">
          <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-muted/30 shadow-sm group-hover:shadow-md transition-shadow duration-300 relative">
            <LazyImage src={article.image} alt={article.title} scale={isHovered ? 1.05 : 1} />
          </div>
        </Link>
        <h3 className="font-serif text-sm md:text-base font-medium line-clamp-2 mb-1 transition-colors group-hover:text-primary leading-snug">
          <Link to={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-xs text-muted-foreground mt-auto">{article.date}</p>
      </motion.article>
    );
  }

  if (variant === 'small') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className="group touch-feedback flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.slug}`} className="relative block overflow-hidden">
          <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-muted/30 shadow-sm group-hover:shadow-lg transition-shadow duration-300 relative">
            <LazyImage src={article.image} alt={article.title} scale={isHovered ? 1.05 : 1} />
          </div>
        </Link>
        <CategoryBadge label={article.categoryLabel} className="mb-2" />
        <h3 className="font-serif text-base md:text-lg font-medium line-clamp-2 mb-2 transition-colors group-hover:text-primary">
          <Link to={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-auto">{article.date}</p>
      </motion.article>
    );
  }

  if (variant === 'large') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="group flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/article/${article.slug}`} className="relative block overflow-hidden">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-3 bg-muted/30 shadow-card group-hover:shadow-lg transition-all duration-500 relative">
            <LazyImage src={article.image} alt={article.title} scale={isHovered ? 1.03 : 1} />
          </div>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge label={article.categoryLabel} />
        </div>
        <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2 transition-colors group-hover:text-primary leading-tight">
          <Link to={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-muted-foreground line-clamp-2 mb-3 text-sm flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t border-divider/60">
          <Link to={`/author/${encodeURIComponent(article.author)}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <AuthorAvatar src={article.authorAvatar} alt={article.author} className="w-6 h-6" />
            <span className="font-semibold text-foreground hover:underline">{article.author}</span>
          </Link>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime}
          </span>
        </div>
      </motion.article>
    );
  }

  // Medium (default — used in Latest News & Category pages)
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group touch-feedback flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/article/${article.slug}`} className="relative block overflow-hidden rounded-xl mb-3.5">
        <div className="aspect-[16/10] rounded-xl overflow-hidden bg-muted/30 relative">
          <LazyImage src={article.image} alt={article.title} scale={isHovered ? 1.05 : 1} />
        </div>
        <div className="absolute top-3 left-3">
          <CategoryBadge label={article.categoryLabel} className="!bg-black/55 !text-white backdrop-blur-sm border-0" />
        </div>
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base md:text-lg font-semibold line-clamp-2 min-h-[2.75rem] mb-2 transition-colors group-hover:text-primary leading-snug">
            <Link to={`/article/${article.slug}`}>{article.title}</Link>
          </h3>

          <p className="text-muted-foreground line-clamp-2 text-sm mb-4 leading-relaxed">{article.excerpt}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-divider/60 mt-auto">
          <Link to={`/author/${encodeURIComponent(article.author)}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <AuthorAvatar src={article.authorAvatar} alt={article.author} className="w-5 h-5" />
            <span className="font-medium text-foreground text-xs hover:underline">{article.author}</span>
          </Link>

          <div className="flex items-center gap-3">
            {article.viewCount !== undefined && article.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                {article.viewCount}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}