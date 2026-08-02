import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Twitter, Facebook, Linkedin, Clock, Copy, Check, MapPin, Newspaper } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { CategoryBadge } from '@/components/news/CategoryBadge';
import { ArticleCard } from '@/components/news/ArticleCard';
import { VideoPlayer } from '@/components/news/VideoPlayer';
import { AudioNarrationPlayer } from '@/components/news/AudioNarrationPlayer';
import { useArticle, useRelatedArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ArticlePage() {
  const { id } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: article, isLoading } = useArticle(id || '');
  const { data: relatedArticles } = useRelatedArticles(
    id || '',
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
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'cite', 'img', 'br', 'hr', 'span', 'div', 'figure', 'figcaption', 'pre', 'code'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'title', 'width', 'height', 'style'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
  }, [article?.content]);

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
              <CategoryBadge category={article.category} />
            </div>

            <h1 className="headline-xl mb-6">{article.title}</h1>

            {/* Author Meta Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 mb-6 shadow-sm">
              <div className="flex items-center gap-3.5">
                {article.authorAvatar && (
                  <img
                    src={article.authorAvatar}
                    alt={article.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-headline text-base">{article.author}</h4>
                  {article.authorRole && (
                    <p className="text-xs text-muted-foreground font-medium">{article.authorRole}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t sm:border-t-0 pt-3 sm:pt-0 border-divider">
                <div>
                  <span className="block font-semibold text-headline">{article.date}</span>
                  <span className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5" /> {article.readTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Audio Narration Player */}
            <AudioNarrationPlayer
              title={article.title}
              excerpt={article.excerpt}
              contentHtml={articleContent}
              readTime={article.readTime}
            />

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
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-blockquote:my-8 prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                  [&_blockquote_cite]:block [&_blockquote_cite]:mt-2 [&_blockquote_cite]:text-sm [&_blockquote_cite]:font-semibold [&_blockquote_cite]:not-italic [&_blockquote_cite]:text-headline"
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
