import { Category } from '@/types/news';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const categoryConfig: Record<Category, { label: string; color: string }> = {
  politics: { label: 'Politics', color: 'category-politics' },
  business: { label: 'Business', color: 'category-business' },
  tech: { label: 'Tech', color: 'category-tech' },
  culture: { label: 'Culture', color: 'category-culture' },
  sports: { label: 'Sports', color: 'category-sports' },
  opinion: { label: 'Opinion', color: 'category-opinion' },
};

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  
  return (
    <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md category-badge ${config.color === 'category-politics' ? 'category-politics' : ''} ${config.color === 'category-business' ? 'category-business' : ''} ${config.color === 'category-tech' ? 'category-tech' : ''} ${config.color === 'category-culture' ? 'category-culture' : ''} ${config.color === 'category-sports' ? 'category-sports' : ''} ${config.color === 'category-opinion' ? 'category-opinion' : ''} ${className}`}>
      {config.label}
    </span>
  );
}
