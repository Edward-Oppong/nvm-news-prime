import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sun, Moon, Bell, Check, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { TopMastheadBar } from './TopMastheadBar';
import nvmLogo from '@/assets/nvm-logo.png';
import { subscribeUser } from '@/lib/subscriptionService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { name: 'General', href: '/category/general' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Business', href: '/category/business' },
];


export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [submittingSub, setSubmittingSub] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

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

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubmittingSub(true);
    try {
      const res = await subscribeUser(subEmail);
      if (res.success) {
        setIsSubscribed(true);
        toast.success(res.message);
        setTimeout(() => setShowSubscribeModal(false), 2000);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Could not subscribe. Please try again.');
    } finally {
      setSubmittingSub(false);
    }
  };

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 bg-background border-b border-border/80 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'
        }`}
        initial={{ y: 0 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <TopMastheadBar />
        <div className="container">
          <div className="flex items-center justify-between h-20 md:h-24 py-2">
            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-7 w-7" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-7 w-7" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group py-1">
              <motion.img
                src={nvmLogo}
                alt="NVM News - Nhyiraba Viglio Media"
                className="h-16 md:h-24 lg:h-28 w-auto object-contain max-h-24 md:max-h-32 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {categories.map((category) => {
                const isActive = location.pathname === category.href ||
                  location.pathname.startsWith(category.href);
                return (
                  <Link
                    key={category.name}
                    to={category.href}
                    className={`relative px-3.5 py-2 text-[13px] font-semibold tracking-wide rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-foreground/8'
                    }`}
                  >
                    {category.name}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                onClick={() => setShowSubscribeModal(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-3.5 sm:px-4 py-2 flex items-center gap-1.5 text-xs sm:text-sm shadow-sm transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>Subscribe</span>
              </Button>

              <motion.button
                onClick={toggleDarkMode}
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted border border-border/60"
                aria-label="Toggle dark mode"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="h-5 w-5 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="h-5 w-5 text-slate-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden bg-background border-b border-border overflow-hidden"
            >
              <nav className="container py-3 grid grid-cols-2 gap-2">
                {categories.map((category, index) => {
                  const isActive = location.pathname.startsWith(category.href);
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: index * 0.04, duration: 0.25 }}
                    >
                      <Link
                        to={category.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-foreground text-background'
                            : 'bg-muted/60 text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <span>{category.name}</span>
                        <ChevronDown className={`h-4 w-4 -rotate-90 ${
                          isActive ? 'opacity-100' : 'opacity-40'
                        }`} />
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="col-span-2 pt-3 border-t border-border flex items-center gap-2 px-2">
                  <Link
                    to="/writer/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-muted text-foreground hover:bg-muted/80 rounded-lg border border-border"
                  >
                    Writer CMS
                  </Link>
                  <Link
                    to="/admin/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                  >
                    Admin Portal
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Subscription Modal for Visitors */}
      {showSubscribeModal && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative my-auto"
            >
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-headline">Get Instant Story Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Subscribe to receive immediate alerts anytime a new story or breaking news is published on NVM News.
                </p>
              </div>

              {isSubscribed ? (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-4 text-center flex items-center justify-center gap-2 font-medium text-sm">
                  <Check className="h-5 w-5 text-emerald-500" />
                  You're subscribed! You will receive story alerts.
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      required
                      autoFocus
                      className="rounded-xl bg-background border-border"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingSub}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-2.5 shadow-sm"
                  >
                    {submittingSub ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      'Subscribe for Story Alerts'
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
