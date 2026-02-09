import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ArrowLeft, BookOpen, Clock, Star, Settings, ChevronRight, Moon, Sun, Bell } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { Switch } from '@/components/ui/switch';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { history, getCategoryPreferences, clearHistory } = useReadingHistory();
  const { savedCount } = useSavedArticles();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const preferences = getCategoryPreferences();
  const totalReadTime = history.reduce((acc, entry) => acc + (entry.readTime || 5), 0);

  const stats = [
    { label: 'Articles Read', value: history.length, icon: BookOpen },
    { label: 'Time Spent', value: `${Math.round(totalReadTime / 60)}h`, icon: Clock },
    { label: 'Saved', value: savedCount, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="container py-8 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-headline">
            Profile
          </h1>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-headline">Reader</h2>
              <p className="text-muted-foreground">Welcome to NVM News</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/50">
                <stat.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-headline">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interests */}
        {preferences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 mb-8"
          >
            <h3 className="font-semibold text-headline mb-4">Your Interests</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <Link
                  key={pref.category}
                  to={`/category/${pref.category.toLowerCase()}`}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize hover:bg-primary/20 transition-colors"
                >
                  {pref.category} ({pref.count})
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl divide-y divide-border"
        >
          <h3 className="font-semibold text-headline p-6 pb-4">Settings</h3>
          
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
              <span>Dark Mode</span>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span>Notifications</span>
            </div>
            <Switch />
          </div>

          <Link 
            to="/saved"
            className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-muted-foreground" />
              <span>Saved Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{savedCount}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>

          <button 
            onClick={clearHistory}
            className="flex items-center justify-between p-6 w-full hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Clear Reading History</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </motion.div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
