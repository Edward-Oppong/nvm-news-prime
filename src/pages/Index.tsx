import { Header } from '@/components/news/Header';
import { LatestNews } from '@/components/news/LatestNews';
import { Footer } from '@/components/news/Footer';
import { HeroSection } from '@/components/news/HeroSection';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { CategoryNewsSection } from '@/components/news/CategoryNewsSection';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { DailyPollWidget } from '@/components/news/DailyPollWidget';
import { useArticles, useTrendingArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <Skeleton className="lg:col-span-7 aspect-[4/3] rounded-xl" />
          <div className="lg:col-span-5 space-y-3">
            <Skeleton className="aspect-[16/9] rounded-xl" />
            <Skeleton className="aspect-[16/9] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-24 text-center">
        <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-40" />
        <h2 className="font-serif text-2xl font-semibold text-headline mb-3">No stories published yet</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Head to the Writer CMS to publish your first article and it will appear here automatically.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-headline text-background rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Open Writer CMS
        </Link>
      </div>
      <Footer />
    </div>
  );
}

const Index = () => {
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: trendingArticles, isLoading: trendingLoading } = useTrendingArticles(5);

  const isLoading = articlesLoading || trendingLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const allArticles = articles ?? [];
  const displayTrending = trendingArticles ?? [];

  if (allArticles.length === 0) {
    return <EmptyState />;
  }

  const politicsArticles = allArticles.filter(a => a.category.toLowerCase() === 'politics');
  const sportsArticles = allArticles.filter(a => a.category.toLowerCase() === 'sports');
  const businessArticles = allArticles.filter(a => a.category.toLowerCase() === 'business');
  const entertainmentArticles = allArticles.filter(a => a.category.toLowerCase() === 'entertainment');

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-16 md:pb-0">
      <Header />

      {/* Breaking News Ticker */}
      <BreakingTicker articles={allArticles} />

      {/* Hero Section — top stories */}
      <div className="py-2">
        <HeroSection articles={allArticles} />
      </div>

      {/* Divider */}
      <div className="container px-3 md:px-4 lg:px-6 py-2"><div className="h-px bg-divider" /></div>

      {/* Latest News + Trending Sidebar */}
      <LatestNews articles={allArticles.slice(3)} trending={displayTrending} />

      {/* Daily Poll & Reader Pulse Section */}
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <DailyPollWidget />
        </div>
      </div>

      {/* Divider */}
      <div className="container px-3 md:px-4 lg:px-6"><div className="h-px bg-divider" /></div>

      {/* Category Rows */}
      {politicsArticles.length > 0 && (
        <CategoryNewsSection
          title="Politics"
          articles={politicsArticles}
          accentColor="category-politics"
          linkHref="/category/politics"
        />
      )}

      {sportsArticles.length > 0 && (
        <CategoryNewsSection
          title="Sports"
          articles={sportsArticles}
          accentColor="category-sports"
          linkHref="/category/sports"
        />
      )}

      {entertainmentArticles.length > 0 && (
        <CategoryNewsSection
          title="Entertainment"
          articles={entertainmentArticles}
          accentColor="category-entertainment"
          linkHref="/category/entertainment"
        />
      )}

      {businessArticles.length > 0 && (
        <CategoryNewsSection
          title="Business"
          articles={businessArticles}
          accentColor="category-business"
          linkHref="/category/business"
        />
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
