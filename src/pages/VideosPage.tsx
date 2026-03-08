import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Video } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { CategoryBadge } from '@/components/news/CategoryBadge';
import { useVideoArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';

function getYouTubeThumbnail(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  return null;
}

export default function VideosPage() {
  const { data: articles, isLoading } = useVideoArticles();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-3 md:px-4 lg:px-6 py-6 md:py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-headline">Videos</h1>
            <p className="text-muted-foreground text-sm mt-1">Watch the latest video news and reports</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        ) : !articles?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No video articles yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/article/${article.id}`} className="block group">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={
                        article.videoUrl
                          ? getYouTubeThumbnail(article.videoUrl) || article.image
                          : article.image
                      }
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <CategoryBadge category={article.category} className="mb-2" />
                      <h3 className="text-white font-serif text-lg font-bold line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/60 text-xs mt-1">{article.author} · {article.date}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
