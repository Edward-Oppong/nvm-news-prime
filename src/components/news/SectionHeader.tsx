import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  accentColor?: 'primary' | 'accent' | 'breaking' | 'category-general' | 'category-entertainment' | 'category-politics' | 'category-sports' | 'category-business';
  linkText?: string;
  linkHref?: string;
}

const colorMap = {
  'primary': 'bg-primary',
  'accent': 'bg-accent',
  'breaking': 'bg-breaking',
  'category-general': 'bg-category-general',
  'category-entertainment': 'bg-category-entertainment',
  'category-politics': 'bg-category-politics',
  'category-sports': 'bg-category-sports',
  'category-business': 'bg-category-business',
};

export function SectionHeader({ 
  title, 
  accentColor = 'primary',
  linkText,
  linkHref 
}: SectionHeaderProps) {
  return (
    <motion.div 
      className="flex items-center gap-4 mb-8"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Accent bar */}
      <div className={`w-1 h-7 rounded-full ${colorMap[accentColor]}`} />

      {/* Title */}
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-headline tracking-tight">
        {title}
      </h2>

      {/* Divider line */}
      <div className="flex-1 h-px bg-divider" />

      {/* Optional link */}
      {linkText && linkHref && (
        <Link 
          to={linkHref}
          className="group flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
        >
          {linkText}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </motion.div>
  );
}
