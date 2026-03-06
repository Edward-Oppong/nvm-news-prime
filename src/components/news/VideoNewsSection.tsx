import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';
import { SectionHeader } from './SectionHeader';

interface VideoNewsSectionProps {
  articles: Article[];
}

function isEmbedUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function getEmbedSrc(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function getYouTubeThumbnail(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  return null;
}

export function VideoNewsSection({ articles }: VideoNewsSectionProps) {
  const videoArticles = articles.filter(a => a.videoUrl);

  if (videoArticles.length === 0) return null;

  const featured = videoArticles[0];
  const secondary = videoArticles.slice(1, 4);

  return (
    <section className="py-4 md:py-8">
      <div className="container px-3 md:px-4 lg:px-6">
        <SectionHeader title="Video" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-4">
          {/* Main featured video */}
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to={`/article/${featured.id}`} className="block group">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {featured.videoUrl && isEmbedUrl(featured.videoUrl) ? (
                  <>
                    <img
                      src={getYouTubeThumbnail(featured.videoUrl) || featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-primary-foreground ml-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-primary-foreground ml-1" />
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <CategoryBadge category={featured.category} className="mb-2" />
                  <h3 className="text-white font-serif text-xl md:text-2xl font-bold line-clamp-2">
                    {featured.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{featured.author} · {featured.date}</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary video cards */}
          <div className="lg:col-span-4 space-y-4">
            {secondary.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/article/${article.id}`} className="flex gap-3 group">
                  <div className="relative w-36 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black">
                    <img
                      src={
                        article.videoUrl && isEmbedUrl(article.videoUrl)
                          ? getYouTubeThumbnail(article.videoUrl) || article.image
                          : article.image
                      }
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-bold text-headline line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{article.date}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
