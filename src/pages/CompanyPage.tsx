import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Megaphone, Newspaper, ArrowLeft, Send, CheckCircle2, Building, Mail } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';
import { MobileBottomNav } from '@/components/news/MobileBottomNav';
import { toast } from 'sonner';

export default function CompanyPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '') || 'careers';

  const [activeTab, setActiveTab] = useState<'careers' | 'advertise' | 'press'>(
    (path as any) || 'careers'
  );

  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  useEffect(() => {
    const current = location.pathname.replace('/', '');
    if (['careers', 'advertise', 'press'].includes(current)) {
      setActiveTab(current as any);
    }
  }, [location.pathname]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) {
      toast.error('Please enter your work email address.');
      return;
    }
    toast.success('Inquiry submitted! Our media team will respond within 24 hours.');
    setContactEmail('');
    setContactMsg('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <Header />

      <main className="container max-w-5xl py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-headline transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
            Nhyiraba Viglio Media Group
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-headline mt-3">
            Building the Future of African Journalism
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl">
            Explore career opportunities, partner with our advertising network, or read official press announcements.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-divider scrollbar-hide">
          {[
            { id: 'careers', label: 'Careers & Fellowships', icon: Briefcase },
            { id: 'advertise', label: 'Advertise & Sponsorships', icon: Megaphone },
            { id: 'press', label: 'Press Releases & Media', icon: Newspaper },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
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

        {/* Content Views */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'careers' && (
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-headline mb-3">Join Our Newsroom</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  We are looking for passionate investigative reporters, audio producers, data journalists, and full-stack engineers to join our newsrooms in Accra, Lagos, and remotely.
                </p>

                <div className="space-y-4">
                  {[
                    { title: 'Senior Political & Policy Reporter', type: 'Full-time · Accra / Hybrid', dept: 'Editorial' },
                    { title: 'Multimedia Video Producer & Editor', type: 'Full-time · Remote', dept: 'Media' },
                    { title: 'Investigative Data Journalism Fellow', type: '6-Month Fellowship', dept: 'Research' },
                    { title: 'Frontend UI/UX Engineer (React / Next.js)', type: 'Full-time · Remote', dept: 'Tech' },
                  ].map((job, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/50 transition-colors gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                            {job.dept}
                          </span>
                          <span className="text-xs text-muted-foreground">{job.type}</span>
                        </div>
                        <h4 className="font-semibold text-headline text-base">{job.title}</h4>
                      </div>
                      <Link
                        to="/contact"
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-center self-start sm:self-auto"
                      >
                        Apply Now
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advertise' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h2 className="font-serif text-2xl font-bold text-headline mb-3">Partner With NVM Prime</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Reach over 1.8M decision-makers, tech founders, policy leaders, and engaged readers across West Africa and international diaspora communities.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <span className="text-2xl font-bold text-primary block">1.8M+</span>
                      <span className="text-xs text-muted-foreground font-medium">Monthly Active Readers</span>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <span className="text-2xl font-bold text-accent block">72%</span>
                      <span className="text-xs text-muted-foreground font-medium">Senior Leaders & Professionals</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-sm text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Premium Sponsored Editorial Features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Audio Story Sponsorships & Video Pre-Rolls
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> High-Impact Category Leaderboard Banners
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-5">
                <form onSubmit={handleInquirySubmit} className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-headline mb-3">Request Media Kit</h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                        Work Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="exec@company.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                        Campaign Goal / Inquiry
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your brand goals..."
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" /> Request Media Pack
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'press' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-headline mb-2">Press & Media Kit</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Official announcements and press inquiries for Nhyiraba Viglio Media.
              </p>

              <div className="space-y-4 pt-4 border-t border-divider">
                <div className="p-4 rounded-xl bg-muted/20 border border-border">
                  <span className="text-xs text-muted-foreground font-semibold">August 2, 2026</span>
                  <h4 className="font-serif text-lg font-bold text-headline mt-1">
                    NVM Media Launches Next-Gen Audio Narration and Reader Reaction Engine
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expanding digital accessibility and interactive journalism across all web and mobile reader platforms.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
