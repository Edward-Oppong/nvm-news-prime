import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Twitter, Facebook, Linkedin, Clock, Copy, Check, MapPin, Newspaper, Eye, ShieldCheck, CheckCircle2, User, BookOpen, Bookmark, MessageCircle, Send, Sparkles } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { CategoryBadge } from '@/components/news/CategoryBadge';
import { ArticleCard } from '@/components/news/ArticleCard';
import { VideoPlayer } from '@/components/news/VideoPlayer';
import { ArticleAudioPlayer } from '@/components/news/ArticleAudioPlayer';
import { SEOHead } from '@/components/seo/SEOHead';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useArticleBySlug, useRelatedArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/** Format a raw view count number into a compact display string */
function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return `${count}`;
}

/** Incognito / Author Avatar with custom silhouette fallback */
function IncognitoAvatar({
  src,
  alt,
  name,
  className = 'w-11 h-11',
}: {
  src?: string | null;
  alt?: string;
  name?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt || name || 'Author'}
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover border-2 border-border/80 shadow-sm shrink-0`}
      />
    );
  }

  // Incognito Avatar Silhouette
  return (
    <div
      className={`${className} rounded-full bg-slate-900 dark:bg-slate-800 text-slate-200 flex items-center justify-center border-2 border-slate-700/60 shadow-inner shrink-0 overflow-hidden select-none`}
      title={name ? `${name} (Incognito)` : 'Incognito Author'}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3/5 h-3/5 text-slate-300"
      >
        <path d="M12 2C9.5 2 7.4 3.5 6.8 5.6C5 6 3 7.2 3 9.5C3 10.3 3.4 11 4 11.5L20 11.5C20.6 11 21 10.3 21 9.5C21 7.2 19 6 17.2 5.6C16.6 3.5 14.5 2 12 2ZM8 7C8 5.9 9.8 5 12 5C14.2 5 16 5.9 16 7L8 7Z" />
        <path d="M4 13.5C4 12.7 4.7 12 5.5 12L18.5 12C19.3 12 20 12.7 20 13.5C20 14.3 19.3 15 18.5 15L15.8 15C15.4 16.7 13.8 18 12 18C10.2 18 8.6 16.7 8.2 15L5.5 15C4.7 15 4 14.3 4 13.5ZM6.5 16.5C5.1 16.5 4 17.6 4 19C4 20.4 5.1 21.5 6.5 21.5C7.9 21.5 9 20.4 9 19C9 17.6 7.9 16.5 6.5 16.5ZM17.5 16.5C16.1 16.5 15 17.6 15 19C15 20.4 16.1 21.5 17.5 21.5C18.9 21.5 20 20.4 20 19C20 17.6 18.9 16.5 17.5 16.5Z" />
      </svg>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const hasTrackedView = useRef(false);

  const { data: article, isLoading } = useArticleBySlug(slug || '');
  const { data: relatedArticles } = useRelatedArticles(
    article?.id || '',
    article?.category || 'politics'
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Increment view count once per page load
  useEffect(() => {
    if (!article?.id || hasTrackedView.current) return;
    hasTrackedView.current = true;

    // Optimistically show the current count + 1
    const currentCount = article.viewCount ?? 0;
    setViewCount(currentCount + 1);

    // Fire and forget the DB increment
    supabase.rpc('increment_article_view', { article_id: article.id }).then(({ error }) => {
      if (error) {
        console.warn('Failed to track article view:', error.message);
        // Revert to original count if RPC fails
        setViewCount(currentCount);
      }
    });
  }, [article?.id, article?.viewCount]);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  const getArticleUrl = useCallback(() => window.location.href, []);

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`📰 *${article?.title || 'NVM News'}*\n\nRead the full story on NVM News:\n${getArticleUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(getArticleUrl());
    const text = encodeURIComponent(article?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getArticleUrl());
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const articleContent = useMemo(() => {
    const raw = article?.content || '';
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'b', 'i', 'u', 's',
        'a', 'ul', 'ol', 'li',
        'blockquote', 'cite',
        'img', 'br', 'hr',
        'span', 'div', 'figure', 'figcaption',
        'pre', 'code',
        // Audio support
        'audio', 'source',
        // Video support
        'video',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'class', 'target', 'rel', 'title',
        'width', 'height', 'style',
        // Audio/video attributes
        'controls', 'preload', 'autoplay', 'loop', 'muted', 'type',
        'playsinline', 'poster',
        // Data attributes for alignment
        'data-align',
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|callto|cid|xmpp|data|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ALLOW_DATA_ATTR: true,
      ADD_ATTR: ['target', 'controls', 'preload', 'src'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
  }, [article?.content]);

  // Detect if the featured image is portrait orientation
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    if (!article?.image) return;
    const img = new Image();
    img.onload = () => {
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    };
    img.src = article.image;
  }, [article?.image]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Skeleton className="h-[40vh] w-full" />
        <div className="container max-w-4xl py-12">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Article not found
  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h1 className="font-serif text-3xl font-bold text-headline mb-3">Article Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            This story may have been removed or the link is incorrect.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-headline text-background rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayViewCount = viewCount ?? article.viewCount ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic SEO & Google News Structured Data */}
      <SEOHead
        title={article.title}
        description={article.excerpt || `${article.title} - Read the full breaking story on NVM News.`}
        image={article.image}
        type="article"
        author={article.authorName || article.author || 'NVM News'}
        publisher={article.publisherName || 'NVM News Network'}
        publishedTime={article.date}
        section={article.categoryLabel}
      />

      {/* Reading progress bar */}
      <div
        className="progress-bar"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      <Header />

      <main>
        {/* Hero Media */}
        <section className="relative">
          {article.videoUrl ? (
            <div className="container max-w-5xl pt-4">
              <VideoPlayer
                src={article.videoUrl}
                poster={article.image}
                title={article.title}
              />
            </div>
          ) : (
            <div className="aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                style={{ objectPosition: isPortrait ? 'center top' : 'center center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
        </section>

        {/* Article content */}
        <article className="container max-w-4xl py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-headline transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <CategoryBadge label={article.categoryLabel} />
            </div>

            <h1 className={`${article.titleFontSize || 'text-4xl'} font-serif font-bold text-headline leading-tight mb-4`}>{article.title}</h1>

            {/* Top metadata strip: date, read time, views */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 pb-1">
              <div>
                <span className="font-semibold text-headline">{article.date}</span>
                <span className="inline-flex items-center gap-1 ml-3">
                  <Clock className="h-3.5 w-3.5" /> {article.readTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-divider pl-4">
                <Eye className="h-3.5 w-3.5 text-primary/70" />
                <span className="font-semibold text-headline">{formatViews(displayViewCount)}</span>
                <span>views</span>
              </div>
            </div>

            {/* Share & Bookmark Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 mb-6 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Share:</span>
                {/* WhatsApp */}
                <button
                  onClick={shareOnWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </button>
                {/* Twitter / X */}
                <button
                  onClick={shareOnTwitter}
                  className="w-8 h-8 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </button>
                {/* Facebook */}
                <button
                  onClick={shareOnFacebook}
                  className="w-8 h-8 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </button>
                {/* LinkedIn */}
                <button
                  onClick={shareOnLinkedIn}
                  className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </button>
                {/* Copy Link */}
                <button
                  onClick={copyLink}
                  className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Bookmark for offline */}
              <button
                onClick={() => toggleBookmark({
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  image: article.image,
                  categoryLabel: article.categoryLabel,
                  date: article.date,
                })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  isBookmarked(article.id)
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground hover:text-headline border-border/80'
                }`}
                title={isBookmarked(article.id) ? 'Saved' : 'Save Story'}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked(article.id) ? 'fill-current' : ''}`} />
                <span>{isBookmarked(article.id) ? 'Saved' : 'Save Story'}</span>
              </button>
            </div>

            {/* AI Audio Story Reader */}
            <ArticleAudioPlayer
              title={article.title}
              contentHtml={article.content}
              excerpt={article.excerpt}
            />

            {/* Article body */}
            {articleContent ? (
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-headline prose-headings:font-semibold
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-5
                  prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-blockquote:my-8 prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                  [&_blockquote_cite]:block [&_blockquote_cite]:mt-2 [&_blockquote_cite]:text-sm [&_blockquote_cite]:font-semibold [&_blockquote_cite]:not-italic [&_blockquote_cite]:text-headline
                  [&_audio]:w-full [&_audio]:rounded-xl [&_audio]:my-4
                  [&_p:empty]:min-h-[1.2em] [&_p:empty]:block"
                dangerouslySetInnerHTML={{ __html: articleContent }}
              />
            ) : (
              <p className="text-muted-foreground italic">{article.excerpt}</p>
            )}

            {/* Author & Credits Meta Card — placed below article content */}
            <div className="mt-10 pt-6 border-t border-divider">
              <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm">
                {/* Top row: byline people */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4">

                  {/* WRITER */}
                  <div className="flex items-center gap-3">
                    <IncognitoAvatar
                      src={article.authorAvatar}
                      alt={article.writerName || article.author}
                      name={article.writerName || article.author}
                      className="w-11 h-11"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">✍️ Writer</span>
                      <p className="font-semibold text-headline text-sm sm:text-base leading-snug">{article.writerName || article.author}</p>
                      {article.authorRole && !article.writerName && (
                        <p className="text-xs text-muted-foreground font-medium">{article.authorRole}</p>
                      )}
                    </div>
                  </div>

                  {/* AUTHOR (byline credit) */}
                  {article.authorName && (
                    <div className="flex items-center gap-3 border-l border-divider pl-5">
                      <IncognitoAvatar
                        src={article.authorAvatar}
                        alt={article.authorName || article.author}
                        name={article.authorName || article.author}
                        className="w-11 h-11"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">📝 Author</span>
                        <p className="font-semibold text-headline text-sm sm:text-base leading-snug">{article.authorName}</p>
                      </div>
                    </div>
                  )}

                  {/* PUBLISHER */}
                  {article.publisherName && (
                    <div className="flex items-center gap-3 border-l border-divider pl-5">
                      <IncognitoAvatar
                        src="/nvm-logo.png"
                        alt={article.publisherName}
                        name={article.publisherName}
                        className="w-11 h-11"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">🏢 Publisher</span>
                        <p className="font-semibold text-headline text-sm sm:text-base leading-snug">{article.publisherName}</p>
                      </div>
                    </div>
                  )}

                  {/* Reviewed & Published By */}
                  {article.reviewedBy && (
                    <div className="flex items-center gap-3 border-l border-divider pl-5">
                      <IncognitoAvatar
                        src={article.reviewedByAvatar}
                        alt={article.reviewedBy}
                        name={article.reviewedBy}
                        className="w-11 h-11"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Reviewed &amp; Published By
                        </span>
                        <h4 className="font-semibold text-headline text-sm sm:text-base leading-snug">{article.reviewedBy}</h4>
                        <p className="text-[11px] text-muted-foreground">{article.reviewedByRole || 'Editorial Administrator'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom row: date, read time, views */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-divider pt-3">
                  <div>
                    <span className="block font-semibold text-headline">Published on {article.date}</span>
                    <span className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5" /> {article.readTime}
                    </span>
                  </div>
                  {/* View Count */}
                  <div className="flex items-center gap-1.5 border-l border-divider pl-4">
                    <Eye className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-semibold text-headline">{formatViews(displayViewCount)}</span>
                    <span className="text-muted-foreground">views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Community & Alerts Banner */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-white">Join NVM News on WhatsApp</h4>
                  <p className="text-xs text-white/80">Get instant breaking Ghana news alerts directly on your phone.</p>
                </div>
              </div>
              <a
                href="https://whatsapp.com/channel/0029Va..."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-white/90 transition-all font-bold text-xs shadow shrink-0"
              >
                <span>Join Channel</span>
                <Send className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        </article>

        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="py-8 md:py-12 bg-muted/30">
            <div className="container">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-headline">
                  Related Stories
                </h2>
                <div className="h-px flex-1 bg-divider ml-6" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle, index) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    article={relatedArticle}
                    variant="medium"
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
