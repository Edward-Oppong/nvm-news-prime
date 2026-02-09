import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Share2, MessageCircle, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ArticleActionsProps {
  articleId: string;
  title: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ArticleActions({ 
  articleId, 
  title, 
  variant = 'default',
  className = '' 
}: ArticleActionsProps) {
  const { isSaved, toggleSave } = useSavedArticles();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 10);
  const saved = isSaved(articleId);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    if (!liked) {
      toast.success('Article liked!');
    }
  };

  const handleSave = () => {
    const newState = toggleSave(articleId);
    toast.success(newState ? 'Article saved!' : 'Removed from saved');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/article/${articleId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Like button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors tap-target ${
          liked 
            ? 'text-live bg-live/10' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={liked ? 'liked' : 'not-liked'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          </motion.div>
        </AnimatePresence>
        {!isCompact && <span className="text-sm font-medium">{likeCount}</span>}
      </motion.button>

      {/* Comment button */}
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors tap-target">
        <MessageCircle className="h-5 w-5" />
        {!isCompact && <span className="text-sm font-medium">12</span>}
      </button>

      {/* Save button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSave}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors tap-target ${
          saved 
            ? 'text-primary bg-primary/10' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={saved ? 'saved' : 'not-saved'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
          </motion.div>
        </AnimatePresence>
        {!isCompact && <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>}
      </motion.button>

      {/* Share button */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors tap-target">
            <Share2 className="h-5 w-5" />
            {!isCompact && <span className="text-sm font-medium">Share</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="end">
          <div className="grid gap-1">
            <button 
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`${window.location.origin}/article/${articleId}`)}`, '_blank');
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              Share on X
            </button>
            <button 
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/article/${articleId}`)}`, '_blank');
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              Share on Facebook
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
              Copy link
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
