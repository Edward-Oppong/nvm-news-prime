import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck,
  FolderOpen, 
  Users, 
  Settings,
  LogOut,
  ExternalLink,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
  }, [location.pathname]);

  const fetchPendingCount = async () => {
    try {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review');
      setPendingCount(count || 0);
    } catch {
      // Fallback
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Review Queue', href: '/admin/review', icon: ClipboardCheck, badge: pendingCount },
    { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Authors', href: '/admin/authors', icon: Users },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin/auth';
  };

  return (
    <aside className="w-64 bg-surface-elevated border-r border-divider min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-divider flex items-center justify-between">
        <Link to="/admin" className="block" onClick={onClose}>
          <h1 className="font-serif text-xl font-bold text-headline">
            NVM<span className="text-primary">News</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
        </Link>

        {/* Close button — only shown on mobile when rendered as a drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {!!item.badge && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-accent text-accent-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-divider space-y-2">
        <Link
          to="/"
          target="_blank"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          View Site
        </Link>
        
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
