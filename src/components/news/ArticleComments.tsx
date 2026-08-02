import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Send, UserCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  roleBadge?: string;
  timeAgo: string;
  content: string;
  likes: number;
  isLiked?: boolean;
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: 'Kofi Mensah',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    roleBadge: 'Verified Reader',
    timeAgo: '2 hours ago',
    content: 'This is a crucial milestone for regional infrastructure. If implemented efficiently, reducing transport costs will directly impact inflation and food security across our markets.',
    likes: 24,
  },
  {
    id: 'c2',
    author: 'Dr. Serwaa Ampofo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    roleBadge: 'Policy Analyst',
    timeAgo: '4 hours ago',
    content: 'Excellent journalism. It’s vital that parliamentary committees ensure strict enforcement guidelines so local startups aren’t sidelined by large conglomerates.',
    likes: 41,
  },
  {
    id: 'c3',
    author: 'Tetteh Quarshie',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    timeAgo: '5 hours ago',
    content: 'Looking forward to seeing how fast the timeline gets deployed. The public transit overhaul in urban centers is long overdue!',
    likes: 12,
  },
];

export function ArticleComments() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please write a comment before posting.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const created: Comment = {
        id: `c-${Date.now()}`,
        author: newAuthor.trim() || 'Anonymous Reader',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newAuthor || 'Reader')}`,
        roleBadge: 'Community Voice',
        timeAgo: 'Just now',
        content: newComment.trim(),
        likes: 1,
        isLiked: true,
      };

      setComments([created, ...comments]);
      setNewComment('');
      setNewAuthor('');
      setIsSubmitting(false);
      toast.success('Your comment has been published to the discussion!');
    }, 400);
  };

  return (
    <section className="py-8 my-8 border-t border-divider">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl font-bold text-headline flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent" />
          <span>Reader Discussion ({comments.length})</span>
        </h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Moderated Forum
        </span>
      </div>

      {/* Post a comment form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 md:p-5 rounded-2xl bg-muted/40 border border-border">
        <div className="mb-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Join the Conversation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Your Name (e.g., Kwame Mensah)"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Share your perspective on this report..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Keep discussions civil and respectful.</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-semibold text-xs shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-9 h-9 rounded-full object-cover border border-border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-headline">{comment.author}</span>
                      {comment.roleBadge && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {comment.roleBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    comment.isLiked
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground hover:text-headline'
                  }`}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-primary' : ''}`} />
                  <span>{comment.likes}</span>
                </button>
              </div>

              <p className="text-sm leading-relaxed text-foreground pl-12">{comment.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
