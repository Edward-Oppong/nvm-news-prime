import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Home, ArrowLeft, Newspaper, Compass, AlertCircle } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { name: 'Politics', href: '/category/politics' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Business', href: '/category/business' },
];

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.warn('404 Page Access:', location.pathname);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1 container max-w-4xl py-12 md:py-20 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full text-center"
        >
          {/* Giant Editorial 404 Badge */}
          <div className="relative inline-block mb-6">
            <span className="font-serif text-8xl md:text-9xl font-extrabold text-primary/10 select-none tracking-tighter">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-primary text-primary-foreground shadow-lg flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Story Not Found
              </span>
            </div>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-headline mb-4 leading-tight">
            Extra! Extra! This Page Has Vanished
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            The article or URL <code className="px-2 py-0.5 rounded bg-muted font-mono text-sm text-foreground">{location.pathname}</code> could not be found. It may have been renamed, archived, or temporarily moved.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search NVM News stories..."
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

          {/* Navigation Options */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
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
          <div className="pt-8 border-t border-divider max-w-lg mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" /> Explore Popular Categories
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
