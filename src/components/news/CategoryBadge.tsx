import { Category } from '@/types/news';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const categoryConfig: Record<Category, { label: string; color: string }> = {
  general: { label: 'General', color: 'category-general' },
  entertainment: { label: 'Entertainment', color: 'category-entertainment' },
  politics: { label: 'Politics', color: 'category-politics' },
  sports: { label: 'Sports', color: 'category-sports' },
  business: { label: 'Business', color: 'category-business' },
};

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  
  return (
    <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest text-primary ${className}`}>
      {config.label}
    </span>
  );
}
