import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface HeroSectionProps {
  article: Article;
}

export function HeroSection({ article }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });
  
  // Parallax effect for background
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-end overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y }}
      >
        <motion.img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
          style={{ scale }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative container pb-12 md:pb-20 pt-32"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-3xl"
        >
          {/* Breaking label with enhanced animation */}
          {article.breaking && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-breaking/20 backdrop-blur-sm border border-breaking/30"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-breaking opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-breaking"></span>
              </span>
              <span className="text-breaking font-bold text-sm uppercase tracking-widest">
                Breaking News
              </span>
            </motion.div>
          )}

          {/* Category with animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CategoryBadge category={article.category} className="mb-4" />
          </motion.div>

          {/* Title with staggered reveal */}
          <motion.h1 
            className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white mb-5 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link 
              to={`/article/${article.id}`} 
              className="hover:underline decoration-2 underline-offset-8 transition-all"
            >
              {article.title}
            </Link>
          </motion.h1>

          {/* Excerpt */}
          <motion.p 
            className="text-base md:text-lg lg:text-xl text-white/85 leading-relaxed mb-6 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {article.excerpt}
          </motion.p>

          {/* Meta with icons */}
          <motion.div 
            className="flex flex-wrap items-center gap-4 md:gap-6 text-white/70 text-sm mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="font-semibold text-white">{article.author}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
            <span>{article.date}</span>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link to={`/article/${article.id}`}>
              <Button 
                size="lg" 
                className="group bg-white text-headline hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 text-base"
              >
                Read Full Story
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator - refined */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-1.5 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
