import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface BookmarkedArticle {
  id: string;
  slug: string;
  title: string;
  image?: string;
  categoryLabel?: string;
  date?: string;
  savedAt: number;
}

const STORAGE_KEY = 'nvm_saved_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const toggleBookmark = (article: {
    id: string;
    slug: string;
    title: string;
    image?: string;
    categoryLabel?: string;
    date?: string;
  }) => {
    if (isBookmarked(article.id)) {
      setBookmarks((prev) => prev.filter((b) => b.id !== article.id));
      toast.info('Removed from saved stories');
    } else {
      const item: BookmarkedArticle = {
        id: article.id,
        slug: article.slug,
        title: article.title,
        image: article.image,
        categoryLabel: article.categoryLabel,
        date: article.date,
        savedAt: Date.now(),
      };
      setBookmarks((prev) => [item, ...prev]);
      toast.success('Story saved for offline reading! 🔖');
    }
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast.info('Removed from saved stories');
  };

  const clearBookmarks = () => {
    setBookmarks([]);
    toast.info('Cleared all saved stories');
  };

  return {
    bookmarks,
    count: bookmarks.length,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearBookmarks,
  };
}
