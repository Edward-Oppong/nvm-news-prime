import { Category } from '@/types/news';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const categoryConfig: Record<Category, { label: string; className: string }> = {
  politics: { label: 'Politics', className: 'category-badge category-politics' },
  business: { label: 'Business', className: 'category-badge category-business' },
  tech: { label: 'Tech', className: 'category-badge category-tech' },
  culture: { label: 'Culture', className: 'category-badge category-culture' },
  sports: { label: 'Sports', className: 'category-badge category-sports' },
  opinion: { label: 'Opinion', className: 'category-badge category-opinion' },
};

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  
  return (
    <span className={`${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
