import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, FileText, Lock, Cookie, Accessibility, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const POLICY_KEYS = ['terms', 'privacy', 'cookies', 'accessibility'] as const;
type PolicyKey = typeof POLICY_KEYS[number];

const tabConfig: { id: PolicyKey; label: string; icon: any; placeholder: string }[] = [
  {
    id: 'terms',
    label: 'Terms of Service',
    icon: FileText,
    placeholder: 'Paste or write your full Terms of Service content here...',
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: Lock,
    placeholder: 'Paste or write your full Privacy Policy content here...',
  },
  {
    id: 'cookies',
    label: 'Cookie Policy',
    icon: Cookie,
    placeholder: 'Paste or write your full Cookie Policy content here...',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Accessibility,
    placeholder: 'Paste or write your Accessibility statement here...',
  },
];

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<PolicyKey | null>(null);
  const [content, setContent] = useState<Record<PolicyKey, string>>({
    terms: '',
    privacy: '',
    cookies: '',
    accessibility: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', POLICY_KEYS as unknown as string[]);

      if (data) {
        const mapped: any = { ...content };
        data.forEach((row: any) => {
          if (POLICY_KEYS.includes(row.key)) {
            mapped[row.key] = row.value || '';
          }
        });
        setContent(mapped);
      }
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const savePolicy = async (key: PolicyKey) => {
    setSaving(key);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value: content[key], updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      toast.success(`${tabConfig.find(t => t.id === key)?.label} saved!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-headline">Site Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Edit legal page content that displays publicly on the website.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl mb-8 text-xs text-subheadline">
        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-headline font-semibold">How this works:</strong> Content typed here is saved in the Supabase database and displayed
          live on the public <strong>/terms</strong>, <strong>/privacy</strong>, <strong>/cookies</strong> and <strong>/accessibility</strong> pages.
          Supports plain text. Each tab saves independently.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="terms">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
            {tabConfig.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5 text-xs font-semibold">
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabConfig.map((tab, index) => (
            <TabsContent key={tab.id} value={tab.id}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface-elevated rounded-2xl border border-divider p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-xl font-bold text-headline">{tab.label}</h2>
                  </div>
                  <Button
                    onClick={() => savePolicy(tab.id)}
                    disabled={saving === tab.id}
                    size="sm"
                  >
                    {saving === tab.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save {tab.label}
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Page content — displayed on the public /{tab.id} page
                  </Label>
                  <Textarea
                    value={content[tab.id]}
                    onChange={(e) => setContent(prev => ({ ...prev, [tab.id]: e.target.value }))}
                    placeholder={tab.placeholder}
                    className="h-[500px] font-mono text-sm leading-relaxed resize-none"
                  />
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
