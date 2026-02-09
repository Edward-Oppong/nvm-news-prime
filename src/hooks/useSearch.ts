import { useState, useEffect, useMemo, useCallback } from 'react';
import { Article } from '@/types/news';
import { mockArticles } from '@/data/mockArticles';

const RECENT_SEARCHES_KEY = 'nvm-news-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export interface SearchResult extends Article {
  matchType: 'title' | 'excerpt' | 'author';
  matchedText: string;
}

interface UseSearchOptions {
  articles?: Article[];
}

export function useSearch(options: UseSearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Use provided articles or fall back to mock data
  const articles = options.articles && options.articles.length > 0 ? options.articles : mockArticles;

  // Load recent searches from localStorage
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

  // Save recent searches to localStorage
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

  // Search through articles
  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];

    const searchLower = query.toLowerCase();
    const matches: SearchResult[] = [];

    articles.forEach(article => {
      // Check title match
      if (article.title.toLowerCase().includes(searchLower)) {
        matches.push({
          ...article,
          matchType: 'title',
          matchedText: article.title,
        });
        return;
      }

      // Check excerpt match
      if (article.excerpt.toLowerCase().includes(searchLower)) {
        matches.push({
          ...article,
          matchType: 'excerpt',
          matchedText: article.excerpt,
        });
        return;
      }

      // Check author match
      if (article.author.toLowerCase().includes(searchLower)) {
        matches.push({
          ...article,
          matchType: 'author',
          matchedText: article.author,
        });
      }
    });

    return matches.slice(0, 8);
  }, [query, articles]);

  // Get suggestions based on query
  const suggestions = useMemo((): string[] => {
    if (!query.trim() || query.length < 2) return [];

    const searchLower = query.toLowerCase();
    const titleWords = new Set<string>();

    articles.forEach(article => {
      // Extract relevant phrases from titles
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
