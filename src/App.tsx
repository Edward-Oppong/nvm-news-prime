import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Critical landing page routes — eager loaded for instant first paint
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";

// Lazy-loaded secondary public pages
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const VideosPage = lazy(() => import("./pages/VideosPage"));
const LegalPolicyPage = lazy(() => import("./pages/LegalPolicyPage"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const AuthorProfilePage = lazy(() => import("./pages/AuthorProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded Admin Pages
const AdminAuth = lazy(() => import("./pages/admin/AdminAuth"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ArticlesList = lazy(() => import("./pages/admin/ArticlesList"));
const ArticleEditor = lazy(() => import("./pages/admin/ArticleEditor"));
const CategoriesList = lazy(() => import("./pages/admin/CategoriesList"));
const AuthorsList = lazy(() => import("./pages/admin/AuthorsList"));
const ReviewQueue = lazy(() => import("./pages/admin/ReviewQueue"));
const SiteSettings = lazy(() => import("./pages/admin/SiteSettings"));
const PollsList = lazy(() => import("./pages/admin/PollsList"));
const SubscribersList = lazy(() => import("./pages/admin/SubscribersList"));

// Lazy-loaded Writer Pages
const WriterAuth = lazy(() => import("./pages/writer/WriterAuth"));
const WriterPortal = lazy(() => import("./pages/writer/WriterPortal"));
const WriterArticleEditor = lazy(() => import("./pages/writer/WriterArticleEditor"));
const WriterProfile = lazy(() => import("./pages/writer/WriterProfile"));

// Non-lazy layouts
import { AdminLayout } from "./components/admin/AdminLayout";
import { WriterLayout } from "./components/writer/WriterLayout";

// Ultra-fast responsive QueryClient with instant refresh & caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000, // 10 seconds fresh time for lightning-fast live refreshes
      gcTime: 5 * 60 * 1000,     // 5 minutes garbage collection
      refetchOnWindowFocus: true, // Instantly update when returning to tab
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Fast loading fallback for lazy-loaded routes
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
    </div>
  );
}

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as const,
  duration: 0.2
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Core Routes */}
          <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
          <Route path="/article/:slug" element={<PageWrapper><ArticlePage /></PageWrapper>} />
          <Route path="/category/:category" element={<PageWrapper><CategoryPage /></PageWrapper>} />
          
          {/* Public Secondary Routes */}
          <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
          <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />
          <Route path="/videos" element={<PageWrapper><VideosPage /></PageWrapper>} />

          {/* Legal & Policy Routes */}
          <Route path="/terms" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
          <Route path="/cookies" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
          <Route path="/accessibility" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />

          {/* Company Routes */}
          <Route path="/careers" element={<PageWrapper><CompanyPage /></PageWrapper>} />
          <Route path="/advertise" element={<PageWrapper><CompanyPage /></PageWrapper>} />
          <Route path="/press" element={<PageWrapper><CompanyPage /></PageWrapper>} />

          {/* Author Profile */}
          <Route path="/author/:name" element={<PageWrapper><AuthorProfilePage /></PageWrapper>} />

          {/* Writer Portal Routes */}
          <Route path="/writer/auth" element={<WriterAuth />} />
          <Route path="/writer" element={<WriterLayout />}>
            <Route index element={<WriterPortal />} />
            <Route path="articles/new" element={<WriterArticleEditor />} />
            <Route path="articles/:id" element={<WriterArticleEditor />} />
            <Route path="profile" element={<WriterProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="review" element={<ReviewQueue />} />
            <Route path="articles" element={<ArticlesList />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/:id" element={<ArticleEditor />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="polls" element={<PollsList />} />
            <Route path="subscribers" element={<SubscribersList />} />
            <Route path="authors" element={<AuthorsList />} />
            <Route path="settings" element={<SiteSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
