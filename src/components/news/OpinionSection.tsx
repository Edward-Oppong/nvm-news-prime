import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Article } from '@/types/news';
import { SectionHeader } from './SectionHeader';

interface OpinionSectionProps {
  articles: Article[];
}

export function OpinionSection({ articles }: OpinionSectionProps) {
  const opinionArticles = articles.slice(0, 3);
  if (opinionArticles.length === 0) return null;

  return (
    <section className="py-4 md:py-5 border-t border-divider">
      <div className="container">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full bg-accent" />
          <h2 className="font-serif text-xl md:text-2xl font-bold text-headline tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Opinion
          </h2>
          <div className="flex-1 h-px bg-divider" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
            Editorial
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opinionArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={`/article/${article.id}`}
                className="group block p-4 rounded-xl border border-divider hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-headline">{article.author}</p>
                    <p className="text-xs text-muted-foreground">{article.date}</p>
                  </div>
                </div>
                <h3 className="font-serif text-base font-semibold leading-snug text-headline group-hover:text-accent transition-colors line-clamp-3">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{article.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
