import { useState, useEffect, useCallback } from 'react';

interface ReadingEntry {
  articleId: string;
  category: string;
  readAt: string;
  readTime?: number;
}

const STORAGE_KEY = 'nvm_reading_history';
const MAX_ENTRIES = 100;

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingEntry[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reading history:', error);
    }
  }, []);

  // Add article to history
  const addToHistory = useCallback((articleId: string, category: string, readTime?: number) => {
    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((entry) => entry.articleId !== articleId);
      
      // Add new entry at the beginning
      const newHistory = [
        {
          articleId,
          category,
          readAt: new Date().toISOString(),
          readTime,
        },
        ...filtered,
      ].slice(0, MAX_ENTRIES);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Get category preferences based on reading history
  const getCategoryPreferences = useCallback(() => {
    const categoryCount: Record<string, number> = {};
    
    history.forEach((entry) => {
      categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }, [history]);

  // Check if article was read
  const wasRead = useCallback((articleId: string) => {
    return history.some((entry) => entry.articleId === articleId);
  }, [history]);

  // Get recent history
  const getRecentHistory = useCallback((limit = 10) => {
    return history.slice(0, limit);
  }, [history]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addToHistory,
    getCategoryPreferences,
    wasRead,
    getRecentHistory,
    clearHistory,
  };
}
