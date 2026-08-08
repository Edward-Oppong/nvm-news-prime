import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  breaking: boolean;
  created_at: string;
  view_count: number;
  reviewed_by_name?: string | null;
  categories: { name: string } | null;
  authors: { name: string } | null;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export default function ArticlesList() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        published,
        featured,
        breaking,
        created_at,
        view_count,
        reviewed_by_name,
        categories (name),
        authors (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch articles');
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  const togglePublish = async (id: string, published: boolean) => {
    const nextPublished = !published;
    let reviewerName: string | null = null;
    const now = new Date().toISOString();

    if (nextPublished && user) {
      reviewerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin Reviewer';
      const { data: authorData } = await supabase
        .from('authors')
        .select('name')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      if (authorData?.name) {
        reviewerName = authorData.name;
      }
    }

    const updatePayload = nextPublished
      ? {
          published: true,
          status: 'published',
          published_at: now,
          reviewed_by: user?.id || null,
          reviewed_by_name: reviewerName,
          reviewed_at: now,
        }
      : {
          published: false,
          status: 'draft',
          published_at: null,
        };

    const { error } = await supabase
      .from('articles')
      .update(updatePayload as any)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update article');
    } else {
      setArticles(articles.map(a => a.id === id ? {
        ...a,
        published: nextPublished,
        reviewed_by_name: nextPublished ? (reviewerName || 'Editorial Admin') : null,
      } : a));
      toast.success(nextPublished ? 'Article published' : 'Article unpublished');
    }
  };

  const deleteArticle = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const { error } = await supabase.from('articles').delete().eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete article');
    } else {
      setArticles(articles.filter(a => a.id !== deleteId));
      toast.success('Article deleted');
    }
    
    setDeleting(false);
    setDeleteId(null);
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-headline">Articles</h1>
          <p className="text-muted-foreground mt-1 text-sm">{articles.length} total articles</p>
        </div>
        <Link to="/admin/articles/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="pl-10"
        />
      </div>

      {/* Articles Table */}
      <div className="bg-surface-elevated rounded-xl border border-divider overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
            <thead className="bg-muted/50 border-b border-divider">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Author (Writer)</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Reviewed By</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Views</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filteredArticles.map((article, index) => (
                <motion.tr
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-headline line-clamp-1">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {article.featured && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Featured</span>
                        )}
                        {article.breaking && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Breaking</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {article.categories?.name || 'Uncategorized'}
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">
                    {article.authors?.name || 'Staff Writer'}
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {article.published ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        {article.reviewed_by_name || 'Editorial Admin'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Pending Review</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-sm font-semibold text-headline">
                      <Eye className="h-3.5 w-3.5 text-primary/60" />
                      {formatViews(article.view_count || 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      article.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(article.id, article.published)}
                        title={article.published ? 'Unpublish' : 'Publish'}
                      >
                        {article.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Link to={`/admin/articles/${article.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(article.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteArticle} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
