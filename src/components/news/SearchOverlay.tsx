import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch, highlightMatch, HighlightPart } from '@/hooks/useSearch';
import { useArticles } from '@/hooks/useArticles';
import { CategoryBadge } from './CategoryBadge';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Fetch articles at the top level to avoid hook ordering issues
  const { data: articles } = useArticles();
  
  const {
    query,
    setQuery,
    results,
    suggestions,
    recentSearches,
    saveRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useSearch({ articles });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      setQuery(searchTerm);
    }
  };

  const handleResultClick = (articleId: string) => {
    saveRecentSearch(query);
    onClose();
    navigate(`/article/${articleId}`);
  };

  const renderHighlightedText = (text: string, searchQuery: string) => {
    const parts = highlightMatch(text, searchQuery);
    return parts.map((part: HighlightPart) => 
      part.type === 'highlight' ? (
        <mark key={part.key} className="bg-primary/20 text-primary px-0.5 rounded">
          {part.text}
        </mark>
      ) : (
        <span key={part.key}>{part.text}</span>
      )
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 top-0 z-50 bg-surface-elevated border-b border-divider shadow-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="container py-6">
              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for news, topics, or authors..."
                  className="w-full pl-14 pr-14 py-4 text-xl bg-muted rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                {/* No query - show recent searches */}
                {!query.trim() && recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleSearch(search)}
                          className="group flex items-center gap-2 px-4 py-2 bg-muted hover:bg-primary/10 rounded-full transition-colors"
                        >
                          <span className="text-sm text-foreground">{search}</span>
                          <X
                            className="h-3 w-3 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(search);
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {query.trim() && suggestions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                      <TrendingUp className="h-4 w-4" />
                      Suggestions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(suggestion)}
                          className="px-4 py-2 bg-muted hover:bg-primary/10 rounded-full text-sm text-foreground transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {query.trim() && results.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                    <div className="space-y-3">
                      {results.map((result) => (
                        <motion.button
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleResultClick(result.id)}
                          className="w-full flex items-start gap-4 p-4 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-left group"
                        >
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <CategoryBadge category={result.category} className="text-xs" />
                            <h3 className="font-serif text-lg font-semibold text-headline mt-1 line-clamp-2">
                              {renderHighlightedText(result.title, query)}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {result.matchType === 'excerpt' 
                                ? renderHighlightedText(result.excerpt, query)
                                : result.matchType === 'author'
                                ? <>By {renderHighlightedText(result.author, query)}</>
                                : result.excerpt
                              }
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {query.trim() && query.length >= 2 && results.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-headline mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try searching with different keywords
                    </p>
                  </div>
                )}

                {/* Type more hint */}
                {query.trim() && query.length < 2 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Type at least 2 characters to search
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
