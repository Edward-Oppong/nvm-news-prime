import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Twitter, Facebook, Linkedin, Clock, Copy, Check, MapPin, Newspaper, Eye, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { CategoryBadge } from '@/components/news/CategoryBadge';
import { ArticleCard } from '@/components/news/ArticleCard';
import { VideoPlayer } from '@/components/news/VideoPlayer';
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

  const getArticleUrl = useCallback(() => window.location.href, []);

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

            <h1 className={`${article.titleFontSize || 'text-4xl'} font-serif font-bold text-headline leading-tight mb-6`}>{article.title}</h1>

            {/* Author & Credits Meta Card — three-tier hierarchy: Writer → Author → Publisher */}
            <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/80 mb-6 shadow-sm">
              {/* Top row: byline people */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">

                {/* WRITER */}
                {article.writerName ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 text-sm font-bold">
                      {article.writerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">✍️ Writer</span>
                      <p className="font-semibold text-headline text-sm leading-snug">{article.writerName}</p>
                    </div>
                  </div>
                ) : (
                  /* Fallback: show the linked author profile if no separate writer name */
                  <div className="flex items-center gap-3">
                    {article.authorAvatar ? (
                      <img
                        src={article.authorAvatar}
                        alt={article.author}
                        className="w-11 h-11 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                        {article.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Written By</span>
                      <h4 className="font-semibold text-headline text-sm sm:text-base leading-snug">{article.author}</h4>
                      {article.authorRole && (
                        <p className="text-xs text-muted-foreground font-medium">{article.authorRole}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* AUTHOR (byline credit) */}
                {article.authorName && (
                  <div className="flex items-center gap-2.5 border-l border-divider pl-5">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-sm font-bold">
                      {article.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">📝 Author</span>
                      <p className="font-semibold text-headline text-sm leading-snug">{article.authorName}</p>
                    </div>
                  </div>
                )}

                {/* PUBLISHER */}
                {article.publisherName && (
                  <div className="flex items-center gap-2.5 border-l border-divider pl-5">
                    <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 text-sm font-bold">
                      {article.publisherName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">🏢 Publisher</span>
                      <p className="font-semibold text-headline text-sm leading-snug">{article.publisherName}</p>
                    </div>
                  </div>
                )}

                {/* Reviewed & Published By — existing logic */}
                {article.reviewedBy && (
                  <div className="flex items-center gap-3 border-l border-divider pl-5">
                    {article.reviewedByAvatar ? (
                      <img
                        src={article.reviewedByAvatar}
                        alt={article.reviewedBy}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Reviewed &amp; Published By
                      </span>
                      <h4 className="font-semibold text-headline text-sm leading-snug">{article.reviewedBy}</h4>
                      <p className="text-[11px] text-muted-foreground">{article.reviewedByRole || 'Editorial Administrator'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom row: date, read time, views */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-divider pt-3">
                <div>
                  <span className="block font-semibold text-headline">{article.date}</span>
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

            {/* Share buttons */}
            <div className="flex items-center justify-between py-4 mb-8 border-y border-divider">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-headline mr-2">Share Story:</span>
                <button
                  onClick={shareOnTwitter}
                  className="w-9 h-9 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="w-9 h-9 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="w-9 h-9 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  onClick={copyLink}
                  className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

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
