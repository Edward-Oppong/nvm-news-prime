import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, Users, TrendingUp, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  articles: number;
  published: number;
  categories: number;
  authors: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ articles: 0, published: 0, categories: 0, authors: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentArticles();
  }, []);

  const fetchStats = async () => {
    const [articlesRes, publishedRes, categoriesRes, authorsRes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', true),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('authors').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      articles: articlesRes.count || 0,
      published: publishedRes.count || 0,
      categories: categoriesRes.count || 0,
      authors: authorsRes.count || 0,
    });
  };

  const fetchRecentArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        published,
        created_at,
        categories (name),
        authors (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentArticles(data || []);
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Articles', value: stats.articles, icon: FileText, color: 'bg-blue-500' },
    { label: 'Published', value: stats.published, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'bg-purple-500' },
    { label: 'Authors', value: stats.authors, icon: Users, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-headline">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to NVM News admin</p>
        </div>
        <Link to="/admin/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface-elevated rounded-xl border border-divider p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-headline">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Articles */}
      <div className="bg-surface-elevated rounded-xl border border-divider">
        <div className="p-6 border-b border-divider flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-headline">Recent Articles</h2>
          <Link to="/admin/articles" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading...</div>
        ) : recentArticles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No articles yet</p>
            <Link to="/admin/articles/new">
              <Button>Create your first article</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {recentArticles.map((article) => (
              <div key={article.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-headline truncate">{article.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{article.categories?.name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span>{article.authors?.name || 'Unknown Author'}</span>
                    <span>•</span>
                    <span className={article.published ? 'text-green-600' : 'text-yellow-600'}>
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <Link to={`/admin/articles/${article.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
