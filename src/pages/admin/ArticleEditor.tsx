import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Clock, Bell } from 'lucide-react';
import { notifySubscribersOnPublish } from '@/lib/subscriptionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaUpload, type VideoItem } from '@/components/admin/MediaUpload';
import { supabase } from '@/integrations/supabase/client';
import { safeInsertArticle, safeUpdateArticle } from '@/lib/supabaseArticles';
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

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    author_id: '',
    image_url: '',
    video_url: '',
    audio_url: '',
    featured: false,
    breaking: false,
    published: false,
    read_time: '5 min read',
    // Three-tier byline credit fields
    writer_name: '',
    author_name: '',
    publisher_name: '',
    title_font_size: 'text-4xl',
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
    const { data } = await supabase.from('authors').select('id, name').order('name');
    setAuthors(data || []);
  };

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Article not found');
      navigate('/admin/articles');
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
      audio_url: data.audio_url || '',
      featured: data.featured ?? false,
      breaking: data.breaking ?? false,
      published: data.published ?? false,
      read_time: data.read_time || '5 min read',
      writer_name: (data as any).writer_name || '',
      author_name: (data as any).author_name || '',
      publisher_name: (data as any).publisher_name || '',
      title_font_size: (data as any).title_font_size || 'text-4xl',
    });

    // Fetch associated videos
    const { data: videoData } = await supabase
      .from('article_videos')
      .select('*')
      .eq('article_id', id)
      .order('sort_order');

    if (videoData) {
      setVideos(videoData.map(v => ({
        id: v.id,
        video_url: v.video_url,
        video_type: v.video_type as 'upload' | 'embed',
        title: v.title || '',
        sort_order: v.sort_order,
      })));
    }

    setLoading(false);
  };

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  /** Calculate read time from HTML content (strips tags, counts words at 238 wpm) */
  const calculateReadTime = useCallback((html: string): string => {
    const text = html.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / 238);
    return `${Math.max(1, minutes)} min read`;
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const saveVideos = async (articleId: string) => {
    // Delete existing videos for this article
    await supabase.from('article_videos').delete().eq('article_id', articleId);

    if (videos.length === 0) return;

    const videoRows = videos.map((v, i) => ({
      article_id: articleId,
      video_url: v.video_url,
      video_type: v.video_type,
      title: v.title || null,
      sort_order: i,
    }));

    const { error } = await supabase.from('article_videos').insert(videoRows);
    if (error) {
      console.error('Failed to save videos:', error);
      toast.error('Failed to save some videos');
    }
  };

  const handleSubmit = async (e?: React.FormEvent, publishState: boolean = form.published) => {
    if (e) e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);

    let reviewerName: string | null = null;
    if (publishState && user) {
      reviewerName = 'Editorial Admin';
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

    const articleData = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content || null,
      category_id: form.category_id || null,
      author_id: form.author_id || null,
      image_url: form.image_url || null,
      video_url: form.video_url || null,
      audio_url: form.audio_url || null,
      featured: form.featured,
      breaking: form.breaking,
      published: publishState,
      status: publishState ? 'published' : 'draft',
      read_time: form.read_time,
      published_at: publishState ? new Date().toISOString() : null,
      reviewed_by: publishState ? (user?.id || null) : null,
      reviewed_by_name: publishState ? reviewerName : null,
      reviewed_at: publishState ? new Date().toISOString() : null,
      // Byline credits
      writer_name: form.writer_name || null,
      author_name: form.author_name || null,
      publisher_name: form.publisher_name || null,
      title_font_size: form.title_font_size || 'text-4xl',
    };

    if (isEditing) {
      const { error } = await safeUpdateArticle(id!, articleData);

      if (error) {
        toast.error(error.message);
      } else {
        await saveVideos(id!);
        await queryClient.invalidateQueries({ queryKey: ['articles'] });
        await queryClient.invalidateQueries({ queryKey: ['featured-article'] });
        await queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
        if (publishState && notifySubscribers) {
          await notifySubscribersOnPublish(form.title, form.slug, form.excerpt, form.image_url);
        }
        toast.success(publishState ? 'Article published live!' : 'Article saved as draft');
        navigate('/admin/articles');
      }
    } else {
      const { data: inserted, error } = await safeInsertArticle(articleData);

      if (error) {
        if (error.code === '23505') {
          toast.error('An article with this slug already exists');
        } else {
          toast.error(error.message);
        }
      } else if (inserted) {
        await saveVideos(inserted.id);
        await queryClient.invalidateQueries({ queryKey: ['articles'] });
        await queryClient.invalidateQueries({ queryKey: ['featured-article'] });
        await queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
        if (publishState && notifySubscribers) {
          await notifySubscribersOnPublish(form.title, form.slug, form.excerpt, form.image_url);
        }
        toast.success(publishState ? 'Article created & published live!' : 'Article created & saved as draft');
        navigate('/admin/articles');
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-headline">
              {isEditing ? 'Edit Article' : 'New Article'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleSubmit(undefined, false)}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(undefined, true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Publish / Update Live' : 'Publish Live'}
          </Button>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Media Upload */}
        <MediaUpload
          imageUrl={form.image_url}
          videoUrl={form.video_url}
          videos={videos}
          audioUrl={form.audio_url}
          onImageChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
          onVideoChange={(url) => setForm(prev => ({ ...prev, video_url: url }))}
          onVideosChange={setVideos}
          onAudioChange={(url) => setForm(prev => ({ ...prev, audio_url: url }))}
        />

        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="Enter article title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="article-url-slug"
            />
          </div>
        </div>

        {/* Category & Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category_id}
              onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Author</Label>
            <Select
              value={form.author_id}
              onValueChange={(value) => setForm(prev => ({ ...prev, author_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief summary of the article..."
            rows={3}
          />
        </div>

        {/* Three-tier Byline Credits */}
        <div className="space-y-3 p-4 bg-muted/30 border border-border/60 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Article Credits (Byline)</span>
            <span className="text-[10px] text-muted-foreground/70">Displayed publicly on the article page</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="writer_name" className="text-xs font-semibold text-blue-600 dark:text-blue-400">✍️ Writer</Label>
              <Input
                id="writer_name"
                value={form.writer_name}
                onChange={(e) => setForm(prev => ({ ...prev, writer_name: e.target.value }))}
                placeholder="Writer's full name"
              />
              <p className="text-[10px] text-muted-foreground">Person who wrote the article</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author_name" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">📝 Author</Label>
              <Input
                id="author_name"
                value={form.author_name}
                onChange={(e) => setForm(prev => ({ ...prev, author_name: e.target.value }))}
                placeholder="Author's full name"
              />
              <p className="text-[10px] text-muted-foreground">Credited author / correspondent</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publisher_name" className="text-xs font-semibold text-purple-600 dark:text-purple-400">🏢 Publisher</Label>
              <Input
                id="publisher_name"
                value={form.publisher_name}
                onChange={(e) => setForm(prev => ({ ...prev, publisher_name: e.target.value }))}
                placeholder="Publisher or organization"
              />
              <p className="text-[10px] text-muted-foreground">Publishing entity or org</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            content={form.content}
            onChange={(content) => setForm(prev => ({ ...prev, content, read_time: calculateReadTime(content) }))}
            placeholder="Write your article content here..."
            titleFontSize={form.title_font_size}
            onTitleFontSizeChange={(size) => setForm(prev => ({ ...prev, title_font_size: size }))}
          />
        </div>

        {/* Read Time — auto-calculated, read-only display */}
        <div className="flex items-center gap-3 py-2 px-4 bg-muted/40 border border-border/60 rounded-xl max-w-xs">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Estimated Read Time</p>
            <p className="text-sm font-semibold text-headline">{form.read_time || '1 min read'}</p>
          </div>
          <span className="ml-auto text-[10px] uppercase tracking-wide font-bold text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">Auto</span>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 p-4 bg-muted/30 border border-border/60 rounded-xl">
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
            <Switch
              id="notifySubscribers"
              checked={notifySubscribers}
              onCheckedChange={setNotifySubscribers}
            />
            <Label htmlFor="notifySubscribers" className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm">
              <Bell className="h-4 w-4 fill-current text-amber-500" />
              Notify Subscribers on Story Publish
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="published"
              checked={form.published}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, published: checked }))}
            />
            <Label htmlFor="published">Published</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="featured"
              checked={form.featured}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="breaking"
              checked={form.breaking}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, breaking: checked }))}
            />
            <Label htmlFor="breaking">Breaking News</Label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-divider">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/articles')}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleSubmit(undefined, false)}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(undefined, true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Publish / Update Live' : 'Publish Live'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
