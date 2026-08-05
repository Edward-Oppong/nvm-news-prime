import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Download,
  Trash2,
  Search,
  RefreshCw,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function SubscribersList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    let list = subscribers;
    if (filter === 'active') list = list.filter((s) => !s.unsubscribed_at);
    if (filter === 'unsubscribed') list = list.filter((s) => !!s.unsubscribed_at);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.email.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [subscribers, search, filter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, subscribed_at, unsubscribed_at')
      .order('subscribed_at', { ascending: false });

    if (error) {
      toast.error('Failed to load subscribers: ' + error.message);
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove subscriber "${email}" permanently?`)) return;
    setDeletingId(id);
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete subscriber.');
    } else {
      toast.success(`Removed ${email}`);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Email', 'Subscribed At', 'Status'],
      ...filtered.map((s) => [
        s.email,
        new Date(s.subscribed_at).toLocaleString(),
        s.unsubscribed_at ? 'Unsubscribed' : 'Active',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nvm-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Subscribers exported to CSV.');
  };

  const activeCount = subscribers.filter((s) => !s.unsubscribed_at).length;
  const unsubCount = subscribers.filter((s) => !!s.unsubscribed_at).length;
  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.subscribed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Total Subscribers', value: subscribers.length, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: 'Joined This Month', value: thisMonth, icon: TrendingUp, color: 'from-blue-500 to-indigo-600' },
    { label: 'Unsubscribed', value: unsubCount, icon: XCircle, color: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-headline flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" />
            Subscribers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage newsletter and story alert subscribers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscribers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-surface-elevated rounded-xl border border-divider p-5 flex items-center gap-4"
          >
            <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl flex-shrink-0`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-headline">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-surface-elevated rounded-xl border border-divider">
        {/* Toolbar */}
        <div className="p-4 border-b border-divider flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-divider p-1 bg-muted/40">
            {(['all', 'active', 'unsubscribed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                  filter === f
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 opacity-50" />
            Loading subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No subscribers found</p>
            {search && (
              <p className="text-sm text-muted-foreground/60 mt-1">
                No results for "<span className="italic">{search}</span>"
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {filtered.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary uppercase">
                      {sub.email.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-headline truncate">{sub.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {sub.unsubscribed_at ? (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                      Unsubscribed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Active
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    disabled={deletingId === sub.id}
                    onClick={() => handleDelete(sub.id, sub.email)}
                  >
                    {deletingId === sub.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-divider">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
              <span className="font-semibold text-foreground">{subscribers.length}</span> subscribers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
