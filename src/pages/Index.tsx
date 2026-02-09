import { Header } from '@/components/news/Header';
import { TopStoriesGrid } from '@/components/news/TopStoriesGrid';
import { LatestNews } from '@/components/news/LatestNews';
import { Footer } from '@/components/news/Footer';
import { FeaturedGrid } from '@/components/news/FeaturedGrid';
import { CategoryNewsSection } from '@/components/news/CategoryNewsSection';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { useArticles, useFeaturedArticle, useTrendingArticles } from '@/hooks/useArticles';
import { mockArticles, featuredArticle as mockFeatured, trendingArticles as mockTrending } from '@/data/mockArticles';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Skeleton className="lg:col-span-7 aspect-[4/3] lg:aspect-auto lg:min-h-[520px] rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-3">
                <Skeleton className="w-32 h-24 rounded-lg flex-shrink-0" />
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
  const displayArticles = allArticles;
  const displayTrending = trendingArticles && trendingArticles.length > 0 
    ? [...trendingArticles, ...mockTrending.filter(m => !trendingArticles.some(t => t.title === m.title))].slice(0, 5)
    : mockTrending;
  const displayLatest = allArticles.slice(1);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const politicsArticles = displayArticles.filter(a => a.category.toLowerCase() === 'politics');
  const techArticles = displayArticles.filter(a => a.category.toLowerCase() === 'tech');
  const cultureArticles = displayArticles.filter(a => a.category.toLowerCase() === 'culture');
  const sportsArticles = displayArticles.filter(a => a.category.toLowerCase() === 'sports');

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-16 md:pb-0">
      <Header />
      
      {/* Hero Featured Grid */}
      <FeaturedGrid articles={displayArticles} />

      {/* Divider */}
      <div className="container"><div className="h-px bg-divider" /></div>
      
      {/* Politics */}
      <CategoryNewsSection 
        title="Politics" 
        articles={politicsArticles} 
        accentColor="category-politics"
        linkHref="/category/politics"
      />
      
      {/* Top Stories — alternating background */}
      <TopStoriesGrid articles={displayArticles.slice(1)} />

      {/* Tech */}
      <CategoryNewsSection 
        title="Technology" 
        articles={techArticles} 
        accentColor="category-tech"
        linkHref="/category/tech"
      />

      {/* Divider */}
      <div className="container"><div className="h-px bg-divider" /></div>

      {/* Culture */}
      <CategoryNewsSection 
        title="Culture" 
        articles={cultureArticles} 
        accentColor="category-culture"
        linkHref="/category/culture"
      />
      
      {/* Latest News with Trending Sidebar */}
      <div className="bg-muted/30">
        <LatestNews articles={displayLatest} trending={displayTrending} />
      </div>

      {/* Sports */}
      <CategoryNewsSection 
        title="Sports" 
        articles={sportsArticles} 
        accentColor="category-sports"
        linkHref="/category/sports"
      />
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
