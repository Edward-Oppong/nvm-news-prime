import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import VideosPage from "./pages/VideosPage";
import LegalPolicyPage from "./pages/LegalPolicyPage";
import CompanyPage from "./pages/CompanyPage";
import AuthorProfilePage from "./pages/AuthorProfilePage";

// Admin Pages
import AdminAuth from "./pages/admin/AdminAuth";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ArticlesList from "./pages/admin/ArticlesList";
import ArticleEditor from "./pages/admin/ArticleEditor";
import CategoriesList from "./pages/admin/CategoriesList";
import AuthorsList from "./pages/admin/AuthorsList";
import ReviewQueue from "./pages/admin/ReviewQueue";
import SiteSettings from "./pages/admin/SiteSettings";

// Writer Pages
import WriterAuth from "./pages/writer/WriterAuth";
import { WriterLayout } from "./components/writer/WriterLayout";
import WriterPortal from "./pages/writer/WriterPortal";
import WriterArticleEditor from "./pages/writer/WriterArticleEditor";
import WriterProfile from "./pages/writer/WriterProfile";

const queryClient = new QueryClient();

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as const,
  duration: 0.25
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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/article/:id" element={<PageWrapper><ArticlePage /></PageWrapper>} />
        <Route path="/category/:category" element={<PageWrapper><CategoryPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
        <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />
        <Route path="/videos" element={<PageWrapper><VideosPage /></PageWrapper>} />
        
        {/* Legal & Policy Routes */}
        <Route path="/terms" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
        <Route path="/cookies" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
        <Route path="/accessibility" element={<PageWrapper><LegalPolicyPage /></PageWrapper>} />
        
        {/* Company & Opportunities Routes */}
        <Route path="/careers" element={<PageWrapper><CompanyPage /></PageWrapper>} />
        <Route path="/advertise" element={<PageWrapper><CompanyPage /></PageWrapper>} />
        <Route path="/press" element={<PageWrapper><CompanyPage /></PageWrapper>} />
        
        {/* Author Profile Route */}
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
          <Route path="authors" element={<AuthorsList />} />
          <Route path="settings" element={<SiteSettings />} />
        </Route>
        
        {/* Catch-all */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
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
