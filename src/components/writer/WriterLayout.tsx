import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { WriterSidebar } from './WriterSidebar';
import { useAuth } from '@/hooks/useAuth';

export function WriterLayout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/writer/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <WriterSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
