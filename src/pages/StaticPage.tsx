import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';

const pageContent: Record<string, { title: string; content: React.ReactNode }> = {
  careers: {
    title: 'Careers',
    content: (
      <>
        <p className="text-xl text-muted-foreground mb-8">
          Join our team of passionate journalists and media professionals. We're always looking for talented individuals who share our commitment to quality journalism.
        </p>
        <h2>Current Openings</h2>
        <p>We're currently hiring for the following positions:</p>
        <ul>
          <li><strong>Senior Reporter</strong> - Politics & Government</li>
          <li><strong>Technology Editor</strong> - Full-time, Remote</li>
          <li><strong>Video Producer</strong> - Multimedia Team</li>
          <li><strong>Data Journalist</strong> - Investigations Unit</li>
        </ul>
        <p>
          To apply, send your resume, portfolio, and a cover letter to{' '}
          <a href="mailto:careers@nvmnews.com" className="text-primary">careers@nvmnews.com</a>
        </p>
      </>
    ),
  },
  advertise: {
    title: 'Advertise With Us',
    content: (
      <>
        <p className="text-xl text-muted-foreground mb-8">
          Reach millions of engaged readers with NVM News advertising solutions.
        </p>
        <h2>Why Advertise with NVM News?</h2>
        <ul>
          <li><strong>2.5M+ daily readers</strong> across all platforms</li>
          <li><strong>180+ countries</strong> reached worldwide</li>
          <li><strong>Premium audience</strong> of informed decision-makers</li>
          <li><strong>Brand-safe environment</strong> with quality journalism</li>
        </ul>
        <h2>Advertising Options</h2>
        <ul>
          <li>Display advertising</li>
          <li>Sponsored content</li>
          <li>Newsletter sponsorship</li>
          <li>Podcast advertising</li>
        </ul>
        <p>
          For advertising inquiries, contact{' '}
          <a href="mailto:advertising@nvmnews.com" className="text-primary">advertising@nvmnews.com</a>
        </p>
      </>
    ),
  },
  press: {
    title: 'Press & Media',
    content: (
      <>
        <p className="text-xl text-muted-foreground mb-8">
          For press inquiries, interview requests, and media information about NVM News.
        </p>
        <h2>Media Contact</h2>
        <p>
          For all press inquiries, please contact our communications team at{' '}
          <a href="mailto:press@nvmnews.com" className="text-primary">press@nvmnews.com</a>
        </p>
        <h2>About NVM News</h2>
        <p>
          NVM News is a leading digital news platform founded in 2020, dedicated to delivering 
          accurate, insightful, and impactful journalism to readers worldwide. Our newsroom 
          comprises award-winning journalists and editors committed to the highest standards 
          of journalistic integrity.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <>
        <p className="text-muted-foreground mb-6">Last updated: January 2026</p>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using NVM News, you accept and agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our services.
        </p>
        <h2>2. Use of Content</h2>
        <p>
          All content on NVM News is protected by copyright. You may read, share, and link to our 
          articles, but you may not reproduce, distribute, or create derivative works without permission.
        </p>
        <h2>3. User Conduct</h2>
        <p>
          Users agree to use our platform responsibly and not engage in any activity that could harm 
          the platform, other users, or violate any laws.
        </p>
        <h2>4. Comments and Submissions</h2>
        <p>
          By submitting content to NVM News, you grant us a non-exclusive license to use, reproduce, 
          and publish that content.
        </p>
        <h2>5. Disclaimer</h2>
        <p>
          NVM News provides content for informational purposes. We strive for accuracy but cannot 
          guarantee that all information is complete or current.
        </p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <p className="text-muted-foreground mb-6">Last updated: January 2026</p>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly (such as email for newsletters) and 
          automatically through cookies and analytics tools.
        </p>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To deliver our news content and services</li>
          <li>To send newsletters and updates you've subscribed to</li>
          <li>To improve our platform and user experience</li>
          <li>To analyze usage patterns and trends</li>
        </ul>
        <h2>Data Protection</h2>
        <p>
          We implement appropriate security measures to protect your personal information. 
          We do not sell your personal data to third parties.
        </p>
        <h2>Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. 
          Contact us at <a href="mailto:privacy@nvmnews.com" className="text-primary">privacy@nvmnews.com</a>.
        </p>
      </>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    content: (
      <>
        <p className="text-muted-foreground mb-6">Last updated: January 2026</p>
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit websites. 
          They help websites remember your preferences and improve your experience.
        </p>
        <h2>Cookies We Use</h2>
        <ul>
          <li><strong>Essential cookies:</strong> Required for basic site functionality</li>
          <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
          <li><strong>Preference cookies:</strong> Remember your settings and choices</li>
        </ul>
        <h2>Managing Cookies</h2>
        <p>
          You can control cookies through your browser settings. Note that disabling certain 
          cookies may affect site functionality.
        </p>
      </>
    ),
  },
  accessibility: {
    title: 'Accessibility Statement',
    content: (
      <>
        <p className="text-xl text-muted-foreground mb-8">
          NVM News is committed to ensuring digital accessibility for all users.
        </p>
        <h2>Our Commitment</h2>
        <p>
          We strive to comply with WCAG 2.1 Level AA standards and continuously work to 
          improve the accessibility of our platform.
        </p>
        <h2>Accessibility Features</h2>
        <ul>
          <li>Semantic HTML structure for screen readers</li>
          <li>Keyboard navigation support</li>
          <li>Alt text for images</li>
          <li>Sufficient color contrast</li>
          <li>Resizable text without loss of functionality</li>
        </ul>
        <h2>Feedback</h2>
        <p>
          If you encounter accessibility barriers, please contact us at{' '}
          <a href="mailto:accessibility@nvmnews.com" className="text-primary">accessibility@nvmnews.com</a>
        </p>
      </>
    ),
  },
};

export default function StaticPage() {
  const { page } = useParams<{ page: string }>();
  const content = page ? pageContent[page] : null;

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-24 text-center">
          <h1 className="headline-lg mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="headline-xl mb-8">{content.title}</h1>
            <div className="prose prose-lg max-w-none text-foreground
              prose-headings:font-serif prose-headings:text-headline prose-headings:font-semibold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:list-disc prose-ul:pl-6
              prose-li:text-foreground">
              {content.content}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
