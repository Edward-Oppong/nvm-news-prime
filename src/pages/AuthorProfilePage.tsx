import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Twitter, ShieldCheck, BookOpen } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { ArticleCard } from '@/components/news/ArticleCard';
import { getAuthorByName } from '@/data/mockAuthors';
import { mockArticles } from '@/data/mockArticles';

export default function AuthorProfilePage() {
  const { name } = useParams();
  const authorName = decodeURIComponent(name || '');

  const author = getAuthorByName(authorName);
  const authorArticles = mockArticles.filter(
    (a) => a.author.toLowerCase() === authorName.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <Header />

      <main className="container max-w-5xl py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-headline transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Journalist Bio Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-card via-muted/20 to-card border border-border shadow-sm mb-10"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary/20 shadow-md flex-shrink-0"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Journalist
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-headline">{author.name}</h1>
              <p className="text-sm md:text-base font-semibold text-primary mt-1">{author.role}</p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-2xl">{author.bio}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 pt-4 border-t border-divider text-xs text-muted-foreground font-medium">
                {author.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-accent" /> {author.location}
                  </span>
                )}
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#1DA1F2] hover:underline"
                  >
                    <Twitter className="h-3.5 w-3.5" /> {author.twitter}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> {authorArticles.length} Published Articles
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Articles by Author */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl font-bold text-headline">Articles by {author.name}</h2>
            <div className="h-px flex-1 bg-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {authorArticles.map((article, idx) => (
              <ArticleCard key={article.id} article={article} variant="medium" index={idx} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
