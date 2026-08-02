import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/common/ImageUploader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function WriterProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorId, setAuthorId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      fetchMyProfile();
    }
  }, [user]);

  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      // Find author record by user_id or email
      const { data } = await supabase
        .from('authors')
        .select('*')
        .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
        .maybeSingle();

      if (data) {
        setAuthorId(data.id);
        setForm({
          name: data.name || '',
          email: data.email || user?.email || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      } else {
        // Default pre-fill
        setForm({
          name: user?.email ? user.email.split('@')[0] : 'Writer',
          email: user?.email || '',
          bio: '',
          avatar_url: '',
        });
      }
    } catch {
      toast.error('Failed to load journalist profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter your full journalist name');
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim() || user?.email,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        user_id: user?.id,
      };

      if (authorId) {
        const { error } = await supabase
          .from('authors')
          .update(payload)
          .eq('id', authorId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('authors')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) setAuthorId(data.id);
      }

      toast.success('Journalist profile saved to database!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Journalist Identity &amp; CMS Profile
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-headline mt-2">
          My Journalist Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your public journalist profile. Your name, bio, and avatar image will automatically display on all articles you write across NVM News.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-elevated rounded-2xl border border-divider p-4 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        {/* Profile Avatar Upload (Main Option) */}
        <div className="space-y-3 pb-6 border-b border-divider">
          <Label className="text-base font-semibold">Profile Avatar Photo</Label>
          <ImageUploader
            value={form.avatar_url}
            onChange={(url) => setForm((prev) => ({ ...prev, avatar_url: url }))}
            bucket="avatars"
            folder="profile-photos"
            label="Avatar Photo"
            aspect="square"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Journalist Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Kwaku Boateng"
              className="font-medium text-headline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Journalist Bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="A brief 2-3 sentence bio describing your reporting background and beat..."
            className="h-28 text-sm"
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-divider">
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Syncs live to Supabase Database
          </span>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Profile Details
          </Button>
        </div>
      </form>
    </div>
  );
}
