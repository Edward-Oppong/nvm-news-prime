import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/common/ImageUploader';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  hero_image_url?: string | null;
  created_at: string;
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#1a1a2e',
    hero_image_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Failed to fetch categories');
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const openNewDialog = () => {
    setEditCategory(null);
    setForm({ name: '', slug: '', description: '', color: '#1a1a2e', hero_image_url: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color,
      hero_image_url: category.hero_image_url || '',
    });
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      name,
      slug: editCategory ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    setSaving(true);

    const categoryData: any = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      color: form.color,
      hero_image_url: form.hero_image_url || null,
    };

    if (editCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editCategory.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Category updated');
        fetchCategories();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert(categoryData);

      if (error) {
        if (error.code === '23505') {
          toast.error('A category with this name or slug already exists');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Category created');
        fetchCategories();
        setIsDialogOpen(false);
      }
    }

    setSaving(false);
  };

  const deleteCategory = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const { error } = await supabase.from('categories').delete().eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete category');
    } else {
      setCategories(categories.filter(c => c.id !== deleteId));
      toast.success('Category deleted');
    }

    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-headline">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">{categories.length} categories — including hero banner images</p>
        </div>
        <Button onClick={openNewDialog} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No categories yet</p>
          </div>
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-surface-elevated rounded-xl border border-divider overflow-hidden"
            >
              {/* Hero image preview */}
              <div className="relative h-32 bg-muted overflow-hidden">
                {category.hero_image_url ? (
                  <img
                    src={category.hero_image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-30" />
                    <span className="text-xs opacity-50">No hero image set</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-lg font-serif font-bold text-headline">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">/{category.slug}</p>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editCategory ? `Edit "${editCategory.name}"` : 'New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description shown on the category hero banner..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color"
                  value={form.color}
                  onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 rounded border border-divider cursor-pointer"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#1a1a2e"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Hero Banner Image Upload */}
            <div className="space-y-2 border-t border-divider pt-4">
              <Label className="text-sm font-semibold">Category Hero Banner Image</Label>
              <p className="text-[11px] text-muted-foreground">
                This image appears as the full-width background behind the category title on the public category page.
              </p>
              <ImageUploader
                value={form.hero_image_url}
                onChange={(url) => setForm(prev => ({ ...prev, hero_image_url: url }))}
                bucket="category-banners"
                folder="banners"
                label="Hero Banner"
                aspect="cover"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editCategory ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Articles using this category will be set to uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
