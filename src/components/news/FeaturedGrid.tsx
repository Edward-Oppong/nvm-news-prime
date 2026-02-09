import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from '@/types/news';
import { CategoryBadge } from './CategoryBadge';

interface FeaturedGridProps {
  articles: Article[];
}

export function FeaturedGrid({ articles }: FeaturedGridProps) {
  const [main, ...side] = articles;
  const sideArticles = side.slice(0, 4);

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main featured article - large left */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to={`/article/${main.id}`}
              className="group block relative overflow-hidden rounded-xl aspect-[4/3] lg:aspect-auto lg:h-full"
            >
              <img 
                src={main.image} 
                alt={main.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <CategoryBadge category={main.category} className="mb-3" />
                <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-3 group-hover:underline decoration-2 underline-offset-4">
                  {main.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base line-clamp-2 hidden md:block">
                  {main.excerpt}
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Side articles - 2x2 grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {sideArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link 
                  to={`/article/${article.id}`}
                  className="group block relative overflow-hidden rounded-lg aspect-[4/3]"
                >
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h4 className="font-serif text-sm md:text-base font-medium text-white leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
                      {article.title}
                    </h4>
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
