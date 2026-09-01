import { useState, useEffect } from 'react';
import { CloudSun, ShieldCheck, PenLine, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { useAuth } from '@/hooks/useAuth';

export function TopMastheadBar() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const { cities, loading } = useWeather();
  const { user, isAdmin, isWriter } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date());

  useEffect(() => {
    if (cities.length === 0) return;
    const timer = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % cities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [cities.length]);

  const currentCity = cities[currentWeatherIndex];

  return (
    <div className="bg-headline text-background/90 text-xs py-1.5 px-4 border-b border-border/20">
      <div className="container flex flex-wrap items-center justify-between gap-2">
        {/* Left: Date & Live Weather */}
        <div className="flex items-center gap-4">
          <span className="font-medium text-background/70 hidden sm:inline-block">
            {formattedDate}
          </span>
          <span className="hidden sm:inline-block text-background/30">•</span>

          {/* Animated Weather Ticker */}
          <div className="flex items-center gap-1.5 bg-background/10 px-2 py-0.5 rounded-full">
            <CloudSun className="h-3.5 w-3.5 text-accent flex-shrink-0" />
            {loading ? (
              <span className="font-medium animate-pulse text-background/50">Loading weather...</span>
            ) : currentCity ? (
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWeatherIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium flex items-center gap-1"
                >
                  <span>{currentCity.city}:</span>
                  <span className="font-semibold text-background">{currentCity.temp}</span>
                  <span>{currentCity.icon}</span>
                </motion.span>
              </AnimatePresence>
            ) : null}
          </div>
        </div>

        {/* Right: Trust badge + conditional Writer CMS & Admin Portal links */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-accent font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Independent &amp; Fact-Checked</span>
          </div>

          {/* Only shown if user is authenticated */}
          {user && (
            <>
              {isWriter && !isAdmin && (
                <>
                  <span className="text-background/30">•</span>
                  <Link
                    to="/writer"
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-background/90 hover:text-accent transition-colors underline underline-offset-2"
                  >
                    <PenLine className="h-3 w-3" />
                    My Stories
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <span className="text-background/30">•</span>
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-background/90 hover:text-accent transition-colors"
                  >
                    <LayoutDashboard className="h-3 w-3" />
                    Admin Panel
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
