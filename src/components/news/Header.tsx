import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Mail, ChevronDown, Sun, Moon, Bell } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SearchOverlay } from './SearchOverlay';
import nvmLogo from '@/assets/nvm-logo.png';

const categories = [
  { name: 'Politics', href: '/category/politics', color: 'category-politics' },
  { name: 'Business', href: '/category/business', color: 'category-business' },
  { name: 'Tech', href: '/category/tech', color: 'category-tech' },
  { name: 'Culture', href: '/category/culture', color: 'category-culture' },
  { name: 'Sports', href: '/category/sports', color: 'category-sports' },
  { name: 'Opinion', href: '/category/opinion', color: 'category-opinion' },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  // Smart header hide/show on scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY.current ? "down" : "up";
    if (direction === "down" && latest > 100 && !isMobileMenuOpen) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setIsScrolled(latest > 20);
    lastScrollY.current = latest;
  });

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const scrollToNewsletter = () => {
    const newsletterSection = document.querySelector('section.bg-headline');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollToNewsletter: true } });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border/50' 
          : 'bg-background/80 backdrop-blur-sm border-b border-divider'
      }`}
      initial={{ y: 0 }}
      animate={{ y: isHidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Top bar */}
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu toggle */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Logo with hover effect */}
          <Link to="/" className="flex-shrink-0 group">
            <motion.img 
              src={nvmLogo} 
              alt="NVM News - Nhyiraba Viglio Media" 
              className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            />
          </Link>

          {/* Desktop Navigation with animated underline */}
          <nav className="hidden md:flex items-center space-x-1">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-headline transition-colors rounded-lg hover:bg-muted/50"
              >
                {category.name}
                {/* Animated underline indicator */}
                <motion.div
                  className="absolute bottom-0 left-1/2 h-0.5 bg-primary rounded-full"
                  initial={{ width: 0, x: '-50%' }}
                  animate={{ 
                    width: hoveredCategory === category.name ? '60%' : 0,
                    x: '-50%'
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Dark mode toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2.5 text-muted-foreground hover:text-headline transition-colors rounded-full hover:bg-muted"
              aria-label="Toggle dark mode"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 text-muted-foreground hover:text-headline transition-colors rounded-full hover:bg-muted"
              aria-label="Search"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5" />
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="default" 
                size="sm" 
                className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300"
                onClick={scrollToNewsletter}
              >
                <Mail className="h-4 w-4" />
                <span>Subscribe</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile menu with staggered animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-surface-elevated border-b border-divider overflow-hidden"
          >
            <nav className="container py-4 space-y-1">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={category.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-4 text-lg font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200"
                  >
                    <span>{category.name}</span>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                className="pt-4 mt-4 border-t border-divider"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="default" 
                  className="w-full bg-primary hover:bg-primary/90 shadow-md"
                  onClick={scrollToNewsletter}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe to Newsletter
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
