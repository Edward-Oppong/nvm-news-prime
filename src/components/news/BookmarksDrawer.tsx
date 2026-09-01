import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight, BookOpen, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarksDrawerProps {
  trigger?: React.ReactNode;
}

export function BookmarksDrawer({ trigger }: BookmarksDrawerProps) {
  const { bookmarks, count, removeBookmark, clearBookmarks } = useBookmarks();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-headline"
            title="Saved Reading List"
          >
            <Bookmark className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {count}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background">
        <SheetHeader className="p-6 border-b border-border/80 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bookmark className="h-4 w-4 fill-current" />
            </div>
            <div>
              <SheetTitle className="font-serif text-lg font-bold text-headline">
                Saved Stories
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {count} {count === 1 ? 'story' : 'stories'} saved offline
              </p>
            </div>
          </div>

          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBookmarks}
              className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
            >
              Clear all
            </Button>
          )}
        </SheetHeader>

        {/* Stories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {count === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-headline text-sm">No saved stories yet</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Click the bookmark icon on any story to save it here for quick access.
              </p>
            </div>
          ) : (
            bookmarks.map((article) => (
              <div
                key={article.id}
                className="group relative p-3 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-all flex gap-3 items-start"
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted"
                  />
                )}
                <div className="flex-1 min-w-0 pr-6">
                  {article.categoryLabel && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                      {article.categoryLabel}
                    </span>
                  )}
                  <Link
                    to={`/article/${article.slug}`}
                    className="font-serif font-bold text-sm text-headline line-clamp-2 hover:text-primary transition-colors leading-snug"
                  >
                    {article.title}
                  </Link>
                  {article.date && (
                    <span className="text-[11px] text-muted-foreground block mt-1">
                      {article.date}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => removeBookmark(article.id)}
                  className="absolute top-2 right-2 text-muted-foreground/50 hover:text-destructive p-1 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
