import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Home, 
  ArrowLeft, 
  Newspaper, 
  Compass, 
  AlertTriangle,
  TrendingUp,
  FileQuestion,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  read_time: string | null;
  categories: { name: string; slug: string } | null;
}

const categories = [
  { name: 'Politics', href: '/category/politics' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Business', href: '/category/business' },
  { name: 'Videos', href: '/videos' },
];

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedArticles, setRecommendedArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const { data } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          read_time,
          categories (name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecommendedArticles((data as any) || []);
    } catch {
      // Fallback silent
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-12 md:py-16 px-4">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-center"
          >
            {/* Top Vintage Newspaper Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent-foreground text-xs font-bold uppercase tracking-wider mb-6">
              <Newspaper className="h-4 w-4 text-accent" />
              NVM Gazette — Missing Story Archive
            </div>

            {/* Giant 404 Graphic */}
            <div className="relative inline-block my-2">
              <span className="font-serif text-8xl sm:text-9xl md:text-[11rem] font-extrabold text-headline/10 select-none tracking-tighter leading-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-surface-elevated/90 backdrop-blur-md border border-divider px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                  <span className="font-serif text-lg md:text-xl font-bold text-headline">
                    Headline Unprinted
                  </span>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-headline mb-4 leading-tight">
              Page Not Found in Our Press Archives
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              We couldn’t find the story or page at <code className="px-2.5 py-1 rounded-md bg-muted font-mono text-xs font-semibold text-headline border border-border">{location.pathname}</code>. It might have been retitled, relocated, or temporarily offline.
            </p>

            {/* Integrated Quick Search */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics or keywords..."
                  className="pl-11 pr-24 h-12 rounded-full border-border bg-surface-elevated text-sm shadow-sm focus-visible:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-4"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="rounded-full gap-2 text-muted-foreground hover:text-headline"
              >
                <ArrowLeft className="h-4 w-4" /> Go Back
              </Button>
              <Link to="/">
                <Button className="rounded-full gap-2">
                  <Home className="h-4 w-4" /> Return to Front Page
                </Button>
              </Link>
            </div>

            {/* Category Shortcuts */}
            <div className="mb-14 pb-10 border-b border-divider max-w-xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" /> Browse Top Desks
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.href}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Recommended Stories Section */}
            {recommendedArticles.length > 0 && (
              <div className="text-left max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-xl font-bold text-headline">
                      Top Stories You Might Like
                    </h2>
                  </div>
                  <Link to="/" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    View All Headlines <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      className="group bg-surface-elevated rounded-xl border border-divider overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      {article.image_url ? (
                        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] w-full bg-muted/60 flex items-center justify-center">
                          <Newspaper className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {article.categories?.name && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">
                              {article.categories.name}
                            </span>
                          )}
                          <h3 className="font-serif font-bold text-headline text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                        </div>
                        {article.read_time && (
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {article.read_time}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
