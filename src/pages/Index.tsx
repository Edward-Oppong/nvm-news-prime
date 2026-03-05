import { Header } from '@/components/news/Header';
import { LatestNews } from '@/components/news/LatestNews';
import { Footer } from '@/components/news/Footer';
import { HeroSection } from '@/components/news/HeroSection';
import { BreakingTicker } from '@/components/news/BreakingTicker';
import { CategoryNewsSection } from '@/components/news/CategoryNewsSection';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { useArticles, useFeaturedArticle, useTrendingArticles } from '@/hooks/useArticles';
import { mockArticles, featuredArticle as mockFeatured, trendingArticles as mockTrending } from '@/data/mockArticles';
import { Skeleton } from '@/components/ui/skeleton';

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

const Index = () => {
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: featuredArticle, isLoading: featuredLoading } = useFeaturedArticle();
  const { data: trendingArticles, isLoading: trendingLoading } = useTrendingArticles(5);

  const isLoading = articlesLoading || featuredLoading || trendingLoading;

  const hasDbData = articles && articles.length > 0;
  
  const allArticles = hasDbData 
    ? [...articles, ...mockArticles.filter(m => !articles.some(a => a.title === m.title))]
    : mockArticles;
  const displayTrending = trendingArticles && trendingArticles.length > 0 
    ? [...trendingArticles, ...mockTrending.filter(m => !trendingArticles.some(t => t.title === m.title))].slice(0, 5)
    : mockTrending;

  if (isLoading) {
    return <LoadingSkeleton />;
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
      <HeroSection articles={allArticles} />

      {/* Latest News + Trending Sidebar */}
      <LatestNews articles={allArticles.slice(6)} trending={displayTrending} />

      {/* Category Rows */}
      <CategoryNewsSection 
        title="Politics" 
        articles={politicsArticles} 
        accentColor="category-politics"
        linkHref="/category/politics"
      />

      <div className="bg-muted/30">
        <CategoryNewsSection 
          title="Sports" 
          articles={sportsArticles} 
          accentColor="category-sports"
          linkHref="/category/sports"
        />
      </div>

      <CategoryNewsSection 
        title="Entertainment" 
        articles={entertainmentArticles} 
        accentColor="category-entertainment"
        linkHref="/category/entertainment"
      />

      <div className="bg-muted/30">
        <CategoryNewsSection 
          title="Business" 
          articles={businessArticles} 
          accentColor="category-business"
          linkHref="/category/business"
        />
      </div>

      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
