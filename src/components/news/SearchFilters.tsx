import { Calendar, User, Tag, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';
import { Category } from '@/types/news';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  activeCount: number;
  onReset: () => void;
  availableAuthors: string[];
  availableCategories: Category[];
}

const dateOptions: { label: string; value: SearchFiltersType['dateRange'] }[] = [
  { label: 'Any time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
];

const categoryLabels: Record<string, string> = {
  general: 'General',
  entertainment: 'Entertainment',
  politics: 'Politics',
  sports: 'Sports',
  business: 'Business',
};

export function SearchFiltersBar({
  filters,
  onFiltersChange,
  activeCount,
  onReset,
  availableAuthors,
  availableCategories,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date filter */}
      <div className="relative">
        <select
          value={filters.dateRange}
          onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value as SearchFiltersType['dateRange'] })}
          className="appearance-none pl-8 pr-6 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-foreground"
        >
          {dateOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Category filter */}
      <div className="relative">
        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as Category | 'all' })}
          className="appearance-none pl-8 pr-6 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-foreground"
        >
          <option value="all">All categories</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>
          ))}
        </select>
        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Author filter */}
      <div className="relative">
        <select
          value={filters.author}
          onChange={(e) => onFiltersChange({ ...filters, author: e.target.value })}
          className="appearance-none pl-8 pr-6 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-foreground"
        >
          <option value="">All authors</option>
          {availableAuthors.map(author => (
            <option key={author} value={author}>{author}</option>
          ))}
        </select>
        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Reset button */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-full transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}
