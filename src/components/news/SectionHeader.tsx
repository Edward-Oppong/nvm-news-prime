import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  accentColor?: 'primary' | 'accent' | 'breaking' | 'category-politics' | 'category-business' | 'category-tech' | 'category-culture' | 'category-sports' | 'category-opinion';
  linkText?: string;
  linkHref?: string;
}

const colorMap = {
  'primary': 'bg-primary',
  'accent': 'bg-accent',
  'breaking': 'bg-breaking',
  'category-politics': 'bg-category-politics',
  'category-business': 'bg-category-business',
  'category-tech': 'bg-category-tech',
  'category-culture': 'bg-category-culture',
  'category-sports': 'bg-category-sports',
  'category-opinion': 'bg-category-opinion',
};

const iconBgMap = {
  'primary': 'bg-primary/10 text-primary',
  'accent': 'bg-accent/10 text-accent',
  'breaking': 'bg-breaking/10 text-breaking',
  'category-politics': 'bg-category-politics/10 text-category-politics',
  'category-business': 'bg-category-business/10 text-category-business',
  'category-tech': 'bg-category-tech/10 text-category-tech',
  'category-culture': 'bg-category-culture/10 text-category-culture',
  'category-sports': 'bg-category-sports/10 text-category-sports',
  'category-opinion': 'bg-category-opinion/10 text-category-opinion',
};

export function SectionHeader({ 
  title, 
  icon: Icon, 
  accentColor = 'primary',
  linkText,
  linkHref 
}: SectionHeaderProps) {
  return (
    <motion.div 
      className="flex items-center justify-between mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        {/* Colored accent bar */}
        <div className={`w-1 h-8 rounded-full ${colorMap[accentColor]}`} />
        
        {/* Icon if provided */}
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBgMap[accentColor]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        {/* Title */}
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-headline">
          {title}
        </h2>
      </div>

      {/* Optional Read More link */}
      {linkText && linkHref && (
        <Link 
          to={linkHref}
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </motion.div>
  );
}
