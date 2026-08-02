import { useState, useEffect } from 'react';
import { CloudSun, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const weatherData = [
  { city: 'Accra', temp: '29°C', icon: '⛅' },
  { city: 'London', temp: '21°C', icon: '🌧️' },
  { city: 'New York', temp: '26°C', icon: '☀️' },
  { city: 'Lagos', temp: '31°C', icon: '⛅' },
];

export function TopMastheadBar() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % weatherData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
            <CloudSun className="h-3.5 w-3.5 text-accent" />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWeatherIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="font-medium flex items-center gap-1"
              >
                <span>{weatherData[currentWeatherIndex].city}:</span>
                <span className="font-semibold text-background">{weatherData[currentWeatherIndex].temp}</span>
                <span>{weatherData[currentWeatherIndex].icon}</span>
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Pledge & Writer CMS link */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 text-[11px] text-accent font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Independent &amp; Fact-Checked</span>
          </div>

          <Link
            to="/admin"
            className="text-[10px] uppercase font-bold tracking-wider text-background/60 hover:text-accent transition-colors underline underline-offset-2"
          >
            Writer CMS
          </Link>
        </div>
      </div>
    </div>
  );
}
