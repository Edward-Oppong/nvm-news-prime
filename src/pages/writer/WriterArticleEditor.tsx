import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaUpload, type VideoItem } from '@/components/admin/MediaUpload';
import { ImageUploader } from '@/components/common/ImageUploader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
}

export default function WriterArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [rejectionNote, setRejectionNote] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    author_id: '',
    image_url: '',
    video_url: '',
    read_time: '5 min read',
  });

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug').order('name');
    setCategories(data || []);
  };

  const fetchAuthors = async () => {
    const { data } = await supabase.from('authors').select('id, name, email, user_id').order('name');
    
    // Only show the logged-in writer's author profile
    const myAuthors = (data || []).filter((a: any) => a.user_id === user?.id || a.email === user?.email);
    
    if (myAuthors.length > 0) {
      setAuthors(myAuthors);
      if (!isEditing) {
        setForm((prev) => ({ ...prev, author_id: myAuthors[0].id }));
      }
    } else {
      // Fallback if profile not created in table yet
      const fallbackName = user?.email ? user.email.split('@')[0] : 'Writer';
      const fallbackAuthor = { id: '', name: fallbackName, email: user?.email || null, user_id: user?.id || null };
      setAuthors([fallbackAuthor]);
    }
  };

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Article not found');
      navigate('/writer');
      return;
    }

    setForm({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      category_id: data.category_id || '',
      author_id: data.author_id || '',
      image_url: data.image_url || '',
      video_url: data.video_url || '',
      read_time: data.read_time || '5 min read',
    });

    setRejectionNote((data as any).rejection_note || null);

    // Fetch attached videos
    const { data: videoData } = await supabase
      .from('article_videos')
      .select('*')
      .eq('article_id', id)
      .order('sort_order');

    if (videoData) {
      setVideos(videoData.map((v) => ({
        id: v.id,
        video_url: v.video_url,
        video_type: v.video_type as any,
        title: v.title || '',
      })));
    }

    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
  };

  const calculateReadTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes || 1} min read`;
  };

  const handleContentChange = useCallback((content: string) => {
    setForm((prev) => ({
      ...prev,
      content,
      read_time: calculateReadTime(content),
    }));
  }, []);

  const saveArticle = async (status: 'draft' | 'pending_review') => {
    if (!form.title.trim()) {
      toast.error('Please enter an article title');
      return;
    }

    if (status === 'draft') setSaving(true);
    if (status === 'pending_review') setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const articleData: any = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt,
        content: form.content,
        category_id: form.category_id || null,
        author_id: form.author_id || null,
        image_url: form.image_url || null,
        video_url: form.video_url || null,
        read_time: form.read_time,
        published: false, // Writers cannot publish directly
        status: status,
        submitted_at: status === 'pending_review' ? now : null,
      };

      let articleId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single();

        if (error) throw error;
        articleId = data.id;
      }

      // Sync attached videos
      if (articleId) {
        await supabase.from('article_videos').delete().eq('article_id', articleId);
        if (videos.length > 0) {
          const videoInserts = videos.map((v, index) => ({
            article_id: articleId,
            video_url: v.video_url,
            video_type: v.video_type,
            title: v.title,
            sort_order: index,
          }));
          await supabase.from('article_videos').insert(videoInserts);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['articles'] });

      if (status === 'pending_review') {
        toast.success('Story submitted to editors for review!');
        navigate('/writer');
      } else {
        toast.success(isEditing ? 'Draft updated' : 'Draft saved');
        if (!isEditing && articleId) {
          navigate(`/writer/articles/${articleId}`);
        }
      }
    } catch {
      toast.error('Failed to save story');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/writer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-headline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Stories
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => saveArticle('draft')}
            disabled={saving || submitting}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>

          <Button
            onClick={() => saveArticle('pending_review')}
            disabled={saving || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit for Review
          </Button>
        </div>
      </div>

      {/* Editor title */}
      <h1 className="font-serif text-3xl font-bold text-headline mb-6">
        {isEditing ? 'Edit Story' : 'New Story'}
      </h1>

      {/* Rejection note banner if revisions requested */}
      {rejectionNote && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-6 flex items-start gap-3 text-sm text-rose-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Editor Requested Revisions:</strong>
            <p className="mt-1">"{rejectionNote}"</p>
            <p className="mt-2 text-xs text-rose-600">Make the requested changes below and click <strong>Submit for Review</strong> when complete.</p>
          </div>
        </motion.div>
      )}

      {/* Main form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-semibold">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Enter a compelling headline..."
            className="text-lg font-serif py-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category_id}
              onValueChange={(value) => setForm((prev) => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author Profile</Label>
            <div className="flex items-center gap-2">
              <Input
                id="author"
                value={authors[0]?.name || user?.email?.split('@')[0] || 'Writer'}
                disabled
                className="bg-muted font-semibold text-headline"
              />
              <Link to="/writer/profile" className="text-xs font-semibold text-primary whitespace-nowrap hover:underline">
                Edit Bio
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automatically locked to your logged-in writer identity.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt / Subtitle</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            placeholder="A brief 1-2 sentence summary of the story..."
            className="h-20"
          />
        </div>

        <div className="space-y-2">
          <Label>Story Content</Label>
          <RichTextEditor
            content={form.content}
            onChange={handleContentChange}
            placeholder="Write your story here..."
          />
        </div>

        {/* Media */}
        <div className="border-t border-divider pt-6 space-y-6">
          <h3 className="font-serif text-xl font-bold text-headline">Featured Media &amp; Attachments</h3>

          <div className="space-y-2">
            <Label>Featured Cover Image</Label>
            <ImageUploader
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
              bucket="article-images"
              folder="articles"
              label="Cover Image"
              aspect="cover"
            />
          </div>

          <div className="space-y-2">
            <Label>Video Attachments</Label>
            <MediaUpload videos={videos} onChange={setVideos} />
          </div>
        </div>
      </div>
    </div>
  );
}
