import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight } from 'lucide-react';
import { Article } from '@/types/news';
import { mockAuthors } from '@/data/mockAuthors';

interface OpinionSectionProps {
  articles: Article[];
}

export function OpinionSection({ articles }: OpinionSectionProps) {
  const opinionArticles = articles.filter(a => a.isOpinion || a.category === 'politics' || a.category === 'business').slice(0, 3);
  if (opinionArticles.length === 0) return null;

  return (
    <section className="py-6 md:py-8 border-t border-b border-divider">
      <div className="container px-3 md:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Editorial Commentary
            </span>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-headline tracking-tight">
              Voices & Columnists
            </h2>
          </div>
          <Link
            to="/category/politics"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-headline transition-colors"
          >
            All Columns <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opinionArticles.map((article, i) => {
            const authorMeta = mockAuthors.find(a => a.name.toLowerCase() === article.author.toLowerCase()) || mockAuthors[i % mockAuthors.length];

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={`/article/${article.id}`}
                  className="group relative flex flex-col h-full p-5 rounded-xl border border-divider hover:border-headline/40 transition-colors"
                >
                  <Quote className="absolute top-4 right-4 h-6 w-6 text-muted-foreground/20" />

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={article.authorAvatar || authorMeta.avatar}
                      alt={article.author}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-headline group-hover:underline">
                        {article.author}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {article.authorRole || authorMeta.role}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-serif text-base font-bold leading-snug text-headline mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    "{article.title}"
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                    {article.excerpt}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
