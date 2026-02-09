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

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  breaking: boolean;
  created_at: string;
  categories: { name: string } | null;
  authors: { name: string } | null;
}

export default function ArticlesList() {
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
    const { error } = await supabase
      .from('articles')
      .update({ published: !published, published_at: !published ? new Date().toISOString() : null })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update article');
    } else {
      setArticles(articles.map(a => a.id === id ? { ...a, published: !published } : a));
      toast.success(published ? 'Article unpublished' : 'Article published');
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-headline">Articles</h1>
          <p className="text-muted-foreground mt-1">{articles.length} total articles</p>
        </div>
        <Link to="/admin/articles/new">
          <Button>
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
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-divider">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Author</th>
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
                  <td className="p-4 text-muted-foreground">
                    {article.authors?.name || 'Unknown'}
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
