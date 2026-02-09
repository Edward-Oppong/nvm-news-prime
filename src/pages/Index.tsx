import { Header } from '@/components/news/Header';
import { TopStoriesGrid } from '@/components/news/TopStoriesGrid';
import { LatestNews } from '@/components/news/LatestNews';
import { Footer } from '@/components/news/Footer';
import { FeaturedGrid } from '@/components/news/FeaturedGrid';
import { CategoryNewsSection } from '@/components/news/CategoryNewsSection';
import { useArticles, useFeaturedArticle, useTrendingArticles } from '@/hooks/useArticles';
import { mockArticles, featuredArticle as mockFeatured, trendingArticles as mockTrending } from '@/data/mockArticles';
import { Skeleton } from '@/components/ui/skeleton';

// Enhanced loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero skeleton */}
      <div className="relative h-[75vh] md:h-[85vh] bg-muted overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container max-w-4xl space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-12 md:h-16 w-full max-w-2xl" />
            <Skeleton className="h-8 w-full max-w-xl" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="container py-16">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Skeleton className="aspect-[16/10] rounded-xl mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
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

  // Combine database data with mock data for richer content display
  const hasDbData = articles && articles.length > 0;
  const displayFeatured = featuredArticle || (hasDbData ? articles[0] : mockFeatured);
  
  // Merge DB articles with mock data, avoiding duplicates by title
  const allArticles = hasDbData 
    ? [...articles, ...mockArticles.filter(m => !articles.some(a => a.title === m.title))]
    : mockArticles;
  const displayArticles = allArticles;
  const displayTrending = trendingArticles && trendingArticles.length > 0 
    ? [...trendingArticles, ...mockTrending.filter(m => !trendingArticles.some(t => t.title === m.title))].slice(0, 5)
    : mockTrending;
  const displayLatest = allArticles.slice(1);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Filter articles by category for section displays
  const politicsArticles = displayArticles.filter(a => a.category.toLowerCase() === 'politics');
  const techArticles = displayArticles.filter(a => a.category.toLowerCase() === 'tech');
  const cultureArticles = displayArticles.filter(a => a.category.toLowerCase() === 'culture');
  const sportsArticles = displayArticles.filter(a => a.category.toLowerCase() === 'sports');

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      {/* Featured Grid */}
      <FeaturedGrid articles={displayArticles} />
      
      {/* Category News Sections */}
      <CategoryNewsSection 
        title="Politics" 
        articles={politicsArticles} 
        accentColor="category-politics"
        linkHref="/category/politics"
      />
      
      {/* Top Stories Grid */}
      <TopStoriesGrid articles={displayArticles.slice(1)} />

      {/* Tech Section */}
      <CategoryNewsSection 
        title="Technology" 
        articles={techArticles} 
        accentColor="category-tech"
        linkHref="/category/tech"
      />

      {/* Culture Section */}
      <CategoryNewsSection 
        title="Culture" 
        articles={cultureArticles} 
        accentColor="category-culture"
        linkHref="/category/culture"
      />
      
      {/* Latest News with Trending Sidebar */}
      <LatestNews articles={displayLatest} trending={displayTrending} />

      {/* Sports Section */}
      <CategoryNewsSection 
        title="Sports" 
        articles={sportsArticles} 
        accentColor="category-sports"
        linkHref="/category/sports"
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
