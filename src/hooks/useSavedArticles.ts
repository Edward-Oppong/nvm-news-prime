import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nvm_saved_articles';

export function useSavedArticles() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load saved articles from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load saved articles:', error);
    }
  }, []);

  // Save article
  const saveArticle = useCallback((articleId: string) => {
    setSavedIds((prev) => {
      if (prev.includes(articleId)) return prev;
      const updated = [...prev, articleId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Unsave article
  const unsaveArticle = useCallback((articleId: string) => {
    setSavedIds((prev) => {
      const updated = prev.filter((id) => id !== articleId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Toggle save state
  const toggleSave = useCallback((articleId: string) => {
    if (savedIds.includes(articleId)) {
      unsaveArticle(articleId);
      return false;
    } else {
      saveArticle(articleId);
      return true;
    }
  }, [savedIds, saveArticle, unsaveArticle]);

  // Check if saved
  const isSaved = useCallback((articleId: string) => {
    return savedIds.includes(articleId);
  }, [savedIds]);

  return {
    savedIds,
    saveArticle,
    unsaveArticle,
    toggleSave,
    isSaved,
    savedCount: savedIds.length,
  };
}
