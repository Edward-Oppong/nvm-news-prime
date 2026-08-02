import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Search, 
  Loader2, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  status?: string;
  rejection_note?: string | null;
  created_at: string;
  categories: { name: string } | null;
}

export default function WriterPortal() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyArticles();
    }
  }, [user]);

  const fetchMyArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          published,
          status,
          rejection_note,
          created_at,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch {
      toast.error('Failed to fetch your articles');
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async (id: string) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('articles')
        .update({
          status: 'pending_review',
          submitted_at: now,
          published: false,
        } as any)
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.map((a) => (a.id === id ? { ...a, status: 'pending_review' } : a)));
      toast.success('Story submitted for editorial review!');
    } catch {
      toast.error('Failed to submit story for review');
    }
  };

  const getStatusBadge = (article: Article) => {
    const status = article.status || (article.published ? 'published' : 'draft');

    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
            <Clock className="h-3 w-3" /> Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-rose-500/10 text-rose-600 rounded-full border border-rose-500/20">
            <AlertCircle className="h-3 w-3" /> Revisions Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-muted text-muted-foreground rounded-full border border-border">
            Draft
          </span>
        );
    }
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-headline">My Stories</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Compose stories, submit drafts for editorial review, and track publishing status.
          </p>
        </div>
        <Link to="/writer/articles/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Write New Story
          </Button>
        </Link>
      </div>

      {/* Info banner for writers */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3 text-xs text-subheadline">
        <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-headline block font-semibold mb-0.5">Editorial Workflow Policy</strong>
          When you compose a story, save it as a draft first. When ready, click <strong>"Submit for Review"</strong>. An editor will proofread your article before it is published live on NVM News.
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your stories..."
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
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4 text-sm">No stories written yet</p>
            <Link to="/writer/articles/new">
              <Button size="sm">Write Your First Story</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {filteredArticles.map((article, index) => {
              const status = article.status || (article.published ? 'published' : 'draft');
              const isDraft = status === 'draft';
              const isRejected = status === 'rejected';

              return (
                <div key={article.id} className="p-5 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        {getStatusBadge(article)}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {article.categories?.name || 'General'}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-headline text-lg mb-1 truncate">
                        {article.title}
                      </h3>

                      {/* Rejection Feedback Note if applicable */}
                      {isRejected && article.rejection_note && (
                        <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-700">
                          <strong>Editor Feedback:</strong> "{article.rejection_note}"
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(isDraft || isRejected) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => submitForReview(article.id)}
                          className="border-primary/40 text-primary hover:bg-primary/10"
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" /> Submit for Review
                        </Button>
                      )}

                      <Link to={`/writer/articles/${article.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> {isRejected ? 'Edit & Resubmit' : 'Edit'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
