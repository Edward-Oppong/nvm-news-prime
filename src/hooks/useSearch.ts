import { useState, useEffect, useMemo, useCallback } from 'react';
import { Article, Category } from '@/types/news';
import { mockArticles } from '@/data/mockArticles';

const RECENT_SEARCHES_KEY = 'nvm-news-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export interface SearchFilters {
  category: Category | 'all';
  author: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export interface SearchResult extends Article {
  matchType: 'title' | 'excerpt' | 'author';
  matchedText: string;
}

interface UseSearchOptions {
  articles?: Article[];
}

function isWithinDateRange(dateStr: string, range: SearchFilters['dateRange']): boolean {
  if (range === 'all') return true;
  const now = new Date();
  const articleDate = new Date(dateStr);
  if (isNaN(articleDate.getTime())) return true;
  const diffMs = now.getTime() - articleDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (range === 'today') return diffDays <= 1;
  if (range === 'week') return diffDays <= 7;
  if (range === 'month') return diffDays <= 30;
  return true;
}

export function useSearch(options: UseSearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    author: '',
    dateRange: 'all',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const articles = options.articles && options.articles.length > 0 ? options.articles : mockArticles;

  // Extract unique authors and categories for filter options
  const availableAuthors = useMemo(() => {
    const authors = new Set(articles.map(a => a.author));
    return Array.from(authors).sort();
  }, [articles]);

  const availableCategories = useMemo(() => {
    const cats = new Set(articles.map(a => a.category));
    return Array.from(cats).sort();
  }, [articles]);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== searchTerm.toLowerCase());
      const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const removeRecentSearch = useCallback((searchTerm: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== searchTerm);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.author) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters({ category: 'all', author: '', dateRange: 'all' });
  }, []);

  // Search + filter
  const results = useMemo((): SearchResult[] => {
    // Apply filters even without query text
    let pool = articles;

    if (filters.category !== 'all') {
      pool = pool.filter(a => a.category === filters.category);
    }
    if (filters.author) {
      pool = pool.filter(a => a.author === filters.author);
    }
    if (filters.dateRange !== 'all') {
      pool = pool.filter(a => isWithinDateRange(a.date, filters.dateRange));
    }

    if (!query.trim() || query.length < 2) {
      // If filters active but no query, return filtered articles
      if (activeFilterCount > 0) {
        return pool.slice(0, 12).map(a => ({ ...a, matchType: 'title' as const, matchedText: a.title }));
      }
      return [];
    }

    const searchLower = query.toLowerCase();
    const matches: SearchResult[] = [];

    pool.forEach(article => {
      if (article.title.toLowerCase().includes(searchLower)) {
        matches.push({ ...article, matchType: 'title', matchedText: article.title });
        return;
      }
      if (article.excerpt.toLowerCase().includes(searchLower)) {
        matches.push({ ...article, matchType: 'excerpt', matchedText: article.excerpt });
        return;
      }
      if (article.author.toLowerCase().includes(searchLower)) {
        matches.push({ ...article, matchType: 'author', matchedText: article.author });
      }
    });

    return matches.slice(0, 12);
  }, [query, articles, filters, activeFilterCount]);

  // Autocomplete suggestions
  const suggestions = useMemo((): string[] => {
    if (!query.trim() || query.length < 2) return [];

    const searchLower = query.toLowerCase();
    const titleWords = new Set<string>();

    articles.forEach(article => {
      const words = article.title.split(' ');
      for (let i = 0; i < words.length; i++) {
        const phrase = words.slice(i, i + 3).join(' ');
        if (phrase.toLowerCase().includes(searchLower)) {
          titleWords.add(phrase);
        }
      }
    });

    return Array.from(titleWords).slice(0, 5);
  }, [query, articles]);

  return {
    query,
    setQuery,
    results,
    suggestions,
    recentSearches,
    saveRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
    isOpen,
    setIsOpen,
    filters,
    setFilters,
    activeFilterCount,
    resetFilters,
    availableAuthors,
    availableCategories,
  };
}

// Helper function to highlight matching text
export interface HighlightPart {
  type: 'highlight' | 'normal';
  text: string;
  key: number;
}

export function highlightMatch(text: string, query: string): HighlightPart[] {
  if (!query.trim()) return [{ type: 'normal', text, key: 0 }];

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => ({
    type: regex.test(part) ? 'highlight' : 'normal',
    text: part,
    key: i,
  }));
}
