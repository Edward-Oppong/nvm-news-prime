import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
import { MediaUpload } from '@/components/admin/MediaUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    author_id: '',
    image_url: '',
    video_url: '',
    featured: false,
    breaking: false,
    published: false,
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
      featured: data.featured,
      breaking: data.breaking,
      published: data.published,
      read_time: data.read_time || '5 min read',
    });
    setLoading(false);
  };

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);

    const articleData = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content || null,
      category_id: form.category_id || null,
      author_id: form.author_id || null,
      image_url: form.image_url || null,
      video_url: form.video_url || null,
      featured: form.featured,
      breaking: form.breaking,
      published: form.published,
      read_time: form.read_time,
      published_at: form.published ? new Date().toISOString() : null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', id);

      if (error) {
        toast.error(error.message);
      } else {
        // Invalidate all article queries to refresh the frontend
        await queryClient.invalidateQueries({ queryKey: ['articles'] });
        await queryClient.invalidateQueries({ queryKey: ['featured-article'] });
        await queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
        toast.success('Article updated');
        navigate('/admin/articles');
      }
    } else {
      const { error } = await supabase
        .from('articles')
        .insert(articleData);

      if (error) {
        if (error.code === '23505') {
          toast.error('An article with this slug already exists');
        } else {
          toast.error(error.message);
        }
      } else {
        // Invalidate all article queries to refresh the frontend
        await queryClient.invalidateQueries({ queryKey: ['articles'] });
        await queryClient.invalidateQueries({ queryKey: ['featured-article'] });
        await queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
        toast.success('Article created');
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
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-bold text-headline">
            {isEditing ? 'Edit Article' : 'New Article'}
          </h1>
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
          onImageChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
          onVideoChange={(url) => setForm(prev => ({ ...prev, video_url: url }))}
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

        {/* Content */}
        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            content={form.content}
            onChange={(content) => setForm(prev => ({ ...prev, content }))}
            placeholder="Write your article content here..."
          />
        </div>

        {/* Read Time */}
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="read_time">Read Time</Label>
          <Input
            id="read_time"
            value={form.read_time}
            onChange={(e) => setForm(prev => ({ ...prev, read_time: e.target.value }))}
            placeholder="5 min read"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-8">
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

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-6 border-t border-divider">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/articles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Article' : 'Create Article'}
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
