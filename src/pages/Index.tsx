import { Header } from '@/components/news/Header';
import { LatestNews } from '@/components/news/LatestNews';
import { Footer } from '@/components/news/Footer';
import { FeaturedGrid } from '@/components/news/FeaturedGrid';

import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { useArticles, useFeaturedArticle, useTrendingArticles } from '@/hooks/useArticles';
import { mockArticles, featuredArticle as mockFeatured, trendingArticles as mockTrending } from '@/data/mockArticles';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <Skeleton className="lg:col-span-7 aspect-[4/3] lg:aspect-auto lg:min-h-[380px] rounded-2xl" />
          <div className="lg:col-span-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="w-28 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
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


  return (
    <div className="min-h-screen bg-background animate-fade-in pb-16 md:pb-0">
      <Header />
      
      {/* Hero Featured Grid */}
      <FeaturedGrid articles={allArticles} />

      {/* Latest News with Trending Sidebar */}
      <LatestNews articles={allArticles.slice(1)} trending={displayTrending} />
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
