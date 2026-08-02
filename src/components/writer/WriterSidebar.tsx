import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  PlusCircle, 
  LogOut,
  ExternalLink,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'My Stories', href: '/writer', icon: FileText },
  { label: 'New Article', href: '/writer/articles/new', icon: PlusCircle },
];

export function WriterSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/writer/auth';
  };

  return (
    <aside className="w-64 bg-surface-elevated border-r border-divider min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-divider">
        <Link to="/writer" className="block">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-xl font-bold text-headline">
              NVM<span className="text-primary">News</span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Writer Portal</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/writer' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-divider space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          View Site
        </Link>
        
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-headline truncate">{user?.email}</p>
          <p className="text-[10px] text-muted-foreground">Staff Journalist</p>
        </div>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
