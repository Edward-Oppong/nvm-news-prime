import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Cookie, Accessibility, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';

type PolicyKey = 'terms' | 'privacy' | 'cookies' | 'accessibility';

// Hardcoded fallback content (shown if DB has no overrides yet)
const fallbackContent: Record<PolicyKey, string> = {
  terms: `Terms of Service

Effective Date: August 1, 2026

Welcome to NVM News ("NVM Media"). By accessing our platform, website, and associated syndication channels, you agree to comply with and be bound by the following terms and conditions.

1. Intellectual Property & Syndication Rights
All original news articles, photojournalism essays, investigative reports, and multimedia player broadcasts are the exclusive property of Nhyiraba Viglio Media. Content may not be scraped, redistributed, or republished without express written authorization from our syndicate desk.

2. User Comments & Moderation Standards
NVM News fosters civil, evidence-based discourse. We reserve the right to remove any comments containing hate speech, defamation, commercial spam, or harassment.`,

  privacy: `Privacy Policy & Data Sovereignty

Effective Date: August 1, 2026

At NVM News, your trust is paramount. We adhere to the strictest global data protection standards, ensuring full transparency regarding how reader data is handled.

1. Data We Collect
We do not require personal identification for reading news stories. For newsletter subscribers and community commenters, we store only the email address and display handles explicitly provided.

2. No Third-Party Data Sales
NVM News will never sell, rent, or lease your personal information or reading histories to third-party ad brokers or data aggregators.`,

  cookies: `Cookie & Local Storage Policy

NVM News uses privacy-preserving local storage and minimal session cookies to remember your reading preferences (such as Dark Mode, Audio Playback speeds, and Reader Reaction votes).

Managing Preferences
You can clear your local storage at any time through your browser settings. Disabling essential preferences will reset your saved theme and vote history.`,

  accessibility: `Accessibility Statement

NVM News is dedicated to making journalism accessible to everyone, including individuals with visual, auditory, motor, or cognitive impairments.

Features Built For Accessibility
- Full Web Speech Audio Narration for all long-form news stories.
- High-contrast light and dark mode color palettes complying with WCAG 2.1 AA guidelines.
- Full keyboard navigation support and visible focus rings across interactive components.
- Screen reader descriptive ARIA tags on images and video players.`,
};

export default function LegalPolicyPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '') || 'terms';

  const [activeTab, setActiveTab] = useState<PolicyKey>(
    (['terms', 'privacy', 'cookies', 'accessibility'].includes(path) ? path : 'terms') as PolicyKey
  );

  const [dbContent, setDbContent] = useState<Partial<Record<PolicyKey, string>>>({});
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    const current = location.pathname.replace('/', '');
    if (['terms', 'privacy', 'cookies', 'accessibility'].includes(current)) {
      setActiveTab(current as PolicyKey);
    }
  }, [location.pathname]);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['terms', 'privacy', 'cookies', 'accessibility'])
      .then(({ data }) => {
        if (data) {
          const mapped: any = {};
          data.forEach((row: any) => {
            if (row.value) mapped[row.key] = row.value;
          });
          setDbContent(mapped);
        }
        setLoadingContent(false);
      })
      .catch(() => setLoadingContent(false));
  }, []);

  const getContent = (key: PolicyKey): string => {
    return dbContent[key] || fallbackContent[key];
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <Header />

      <main className="container max-w-4xl py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-headline transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            NVM Media Trust &amp; Governance
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-headline mt-3">
            Legal &amp; Privacy Framework
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Our commitment to editorial independence, reader privacy, data protection, and universal accessibility.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-divider scrollbar-hide">
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
            { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PolicyKey)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-muted/60 text-muted-foreground hover:text-headline hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loadingContent ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-headline prose-p:text-foreground prose-p:leading-relaxed"
          >
            <div className="whitespace-pre-wrap text-sm md:text-base text-foreground leading-relaxed">
              {getContent(activeTab)}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
