import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  FolderOpen, 
  FileText, 
  Loader2, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReviewArticle {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  read_time: string | null;
  status?: string;
  submitted_at?: string;
  created_at: string;
  categories: { name: string } | null;
  authors_public: { name: string; avatar_url: string | null } | null;
}

export default function ReviewQueue() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ReviewArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ReviewArticle | null>(null);
  
  // Rejection modal
  const [rejectingArticle, setRejectingArticle] = useState<ReviewArticle | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // First try status = 'pending_review'
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          excerpt,
          content,
          image_url,
          read_time,
          published,
          created_at,
          categories (name),
          authors_public (name, avatar_url)
        `)
        .eq('published', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch {
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (article: ReviewArticle) => {
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      let reviewerName = 'Editorial Admin';
      if (user) {
        const { data: authorData } = await supabase
          .from('authors')
          .select('name')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (authorData?.name?.trim()) {
          reviewerName = authorData.name;
        } else if (user.user_metadata?.full_name?.trim()) {
          reviewerName = user.user_metadata.full_name;
        } else if (user.email) {
          const raw = user.email.split('@')[0].replace(/[0-9_.-]+/g, ' ').trim();
          reviewerName = raw
            ? raw.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            : 'Editorial Admin';
        }
      }

      const updatePayload: any = {
        published: true,
        published_at: now,
        status: 'published',
        reviewed_by: user?.id || null,
        reviewed_by_name: reviewerName,
        reviewed_at: now,
      };

      const { error } = await supabase
        .from('articles')
        .update(updatePayload)
        .eq('id', article.id);

      if (error) throw error;

      setArticles(articles.filter((a) => a.id !== article.id));
      if (selectedArticle?.id === article.id) setSelectedArticle(null);
      toast.success(`"${article.title}" has been approved & published!`);
    } catch {
      toast.error('Failed to approve article');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingArticle) return;
    if (!rejectionNote.trim()) {
      toast.error('Please provide a reason for requesting revisions');
      return;
    }

    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      const updatePayload: any = {
        published: false,
        status: 'rejected',
        rejection_note: rejectionNote.trim(),
        reviewed_by: user?.id || null,
        reviewed_at: now,
      };

      const { error } = await supabase
        .from('articles')
        .update(updatePayload)
        .eq('id', rejectingArticle.id);

      if (error) throw error;

      setArticles(articles.filter((a) => a.id !== rejectingArticle.id));
      if (selectedArticle?.id === rejectingArticle.id) setSelectedArticle(null);
      toast.info(`Article returned to writer for revision.`);
      setRejectingArticle(null);
      setRejectionNote('');
    } catch {
      toast.error('Failed to reject article');
    } finally {
      setActionLoading(false);
    }
  };

  const getWordCount = (content: string | null) => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, ' ');
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-headline">Editorial Review Queue</h1>
            <span className="px-2.5 py-1 text-xs font-bold bg-accent/20 text-accent-foreground rounded-full">
              {articles.length} Pending
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Review writer submissions, proofread content, and publish or request revisions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Fetching pending submissions...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-surface-elevated rounded-2xl border border-divider p-16 text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-headline mb-2">Review Queue is Clear!</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            All submitted articles have been reviewed. When writers submit new stories for approval, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-5 space-y-4">
            {articles.map((article, index) => {
              const isSelected = selectedArticle?.id === article.id;
              const wordCount = getWordCount(article.content);

              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedArticle(article)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-card border-primary shadow-md ring-1 ring-primary'
                      : 'bg-surface-elevated border-divider hover:border-headline/30 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {article.categories?.name || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.submitted_at
                        ? format(new Date(article.submitted_at), 'MMM d, h:mm a')
                        : format(new Date(article.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-headline text-base mb-2 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs border-t border-divider pt-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-headline">
                        {article.authors_public?.name || 'Staff Writer'}
                      </span>
                    </div>
                    <span>{wordCount} words • {article.read_time || '3 min'}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Article Inspector & Action Panel */}
          <div className="lg:col-span-7">
            {selectedArticle ? (
              <div className="sticky top-8 bg-surface-elevated rounded-2xl border border-divider p-6 shadow-sm">
                {/* Meta details bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-divider mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      {selectedArticle.categories?.name || 'Uncategorized'}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-headline mt-1">
                      {selectedArticle.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span>By <strong className="text-headline">{selectedArticle.authors_public?.name || 'Staff Writer'}</strong></span>
                      <span>•</span>
                      <span>{getWordCount(selectedArticle.content)} words</span>
                      <span>•</span>
                      <span>{selectedArticle.read_time || '5 min read'}</span>
                    </p>
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectingArticle(selectedArticle)}
                      disabled={actionLoading}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" /> Request Revisions
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(selectedArticle)}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >

                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      )}
                      Approve &amp; Publish
                    </Button>
                  </div>
                </div>

                {/* Excerpt */}
                {selectedArticle.excerpt && (
                  <div className="p-4 bg-muted/40 rounded-xl mb-6 border-l-4 border-primary italic text-sm text-subheadline">
                    "{selectedArticle.excerpt}"
                  </div>
                )}

                {/* Main article content preview */}
                <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto pr-2 border border-divider rounded-xl p-4 bg-card">
                  {selectedArticle.content ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                  ) : (
                    <p className="text-muted-foreground italic">No article body provided.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-surface-elevated rounded-2xl border border-divider p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Select an article from the queue on the left to preview and review it.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Revisions / Reject Dialog */}
      <Dialog open={!!rejectingArticle} onOpenChange={() => setRejectingArticle(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Request Revisions
            </DialogTitle>
            <DialogDescription>
              Provide clear feedback to the writer explaining why this story needs revisions before it can be published.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. Please clarify the source in section 2 and double check the statistic on line 14."
              className="h-32 text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRejectingArticle(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading || !rejectionNote.trim()}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Feedback to Writer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
