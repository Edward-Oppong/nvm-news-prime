import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Twitter, Facebook, Linkedin, Clock, User, Copy, Check } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { CategoryBadge } from '@/components/news/CategoryBadge';
import { ArticleCard } from '@/components/news/ArticleCard';
import { VideoPlayer } from '@/components/news/VideoPlayer';
import { useArticle, useRelatedArticles } from '@/hooks/useArticles';
import { mockArticles } from '@/data/mockArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ArticlePage() {
  const { id } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const isMockId = id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const { data: dbArticle, isLoading } = useArticle(isMockId ? '' : (id || ''));
  const { data: dbRelated } = useRelatedArticles(
    isMockId ? '' : (id || ''), 
    dbArticle?.category || 'politics'
  );
  
  const mockArticle = mockArticles.find((a) => a.id === id) || mockArticles[0];
  const article = isMockId ? mockArticle : (dbArticle || mockArticle);
  
  const mockRelated = mockArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);
  const relatedArticles = dbRelated && dbRelated.length > 0 ? dbRelated : mockRelated;

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
    const text = encodeURIComponent(article.title);
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

  const rawContent = article.content || `
    <p class="text-xl leading-relaxed mb-6 text-subheadline">
      ${article.excerpt}
    </p>

    <p>
      In a development that has sent shockwaves through the international community, world leaders have announced a historic agreement that experts are calling the most significant diplomatic achievement of the decade. The accord, reached after months of intense negotiations, represents a fundamental shift in how nations approach global challenges.
    </p>

    <p>
      The announcement came at the conclusion of a marathon three-day summit, where representatives from over 190 nations gathered to address mounting concerns about the future of international cooperation. Negotiators worked through the night in the final hours, hammering out the last remaining points of contention.
    </p>

    <blockquote>
      <p>"This agreement proves that when we work together, there is no challenge too great for humanity to overcome. Today, we have chosen hope over fear, cooperation over division."</p>
      <cite>— Secretary-General Maria Santos</cite>
    </blockquote>

    <h2>A New Framework for Global Action</h2>

    <p>
      The agreement introduces a comprehensive framework that addresses multiple interconnected challenges. At its core, the accord establishes binding commitments for all signatory nations, with clear timelines and accountability mechanisms designed to ensure compliance.
    </p>

    <p>
      Key provisions of the agreement include unprecedented funding mechanisms, technology transfer arrangements, and support systems for developing nations. These measures are designed to ensure that the burden of implementation is shared equitably across the global community.
    </p>

    <h2>What This Means for the Future</h2>

    <p>
      Analysts suggest that the agreement could fundamentally reshape international relations for decades to come. The new frameworks established by the accord create opportunities for enhanced cooperation across a range of sectors, from technology and innovation to trade and security.
    </p>

    <p>
      However, significant challenges remain. Implementation will require sustained political will, substantial financial investment, and ongoing collaboration between nations with sometimes divergent interests. Critics have raised concerns about enforcement mechanisms and the adequacy of proposed timelines.
    </p>

    <p>
      Despite these challenges, the overwhelming consensus among experts is one of cautious optimism. The agreement represents a rare moment of global unity, and its successful implementation could set a powerful precedent for addressing other pressing international challenges.
    </p>
  `;

  const articleContent = useMemo(() => {
    return DOMPurify.sanitize(rawContent, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'cite', 'img', 'br', 'hr', 'span', 'div', 'figure', 'figcaption', 'pre', 'code'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'title', 'width', 'height', 'style'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });
  }, [rawContent]);

  if (isLoading && !isMockId) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
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

            <CategoryBadge category={article.category} className="mb-4" />

            <h1 className="headline-xl mb-6">{article.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-divider">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-headline">{article.author}</p>
                  <p className="text-sm text-muted-foreground">{article.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{article.readTime}</span>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center py-4 mb-8 border-b border-divider">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
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
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Article body */}
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
          </motion.div>
        </article>

        {/* Related articles */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-headline">
                Related Stories
              </h2>
              <div className="h-px flex-1 bg-divider ml-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </main>

      <Footer />
    </div>
  );
}
