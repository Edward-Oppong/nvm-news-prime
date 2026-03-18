import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, ArrowUpRight, Heart } from 'lucide-react';
import nvmLogo from '@/assets/nvm-logo.png';

const footerLinks = {
  news: [
    { name: 'General', href: '/category/general' },
    { name: 'Entertainment', href: '/category/entertainment' },
    { name: 'Politics', href: '/category/politics' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Business', href: '/category/business' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Advertise', href: '/advertise' },
    { name: 'Press', href: '/press' },
    { name: 'Admin', href: '/admin/auth' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/nvmnews', color: 'hover:bg-[#1DA1F2]' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/nvmnews', color: 'hover:bg-[#1877F2]' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/nvmnews', color: 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@nvmnews', color: 'hover:bg-[#FF0000]' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/nvmnews', color: 'hover:bg-[#0A66C2]' },
];

export function Footer() {
  return (
    // Fix: replaced `bg-headline` (a CSS variable that shifts with the theme) with a
    // fixed dark color so the footer always stays dark regardless of light/dark mode toggle.
    <footer className="bg-gray-950 text-white/70">
      <div className="container px-3 md:px-4 lg:px-6 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand column */}
          <motion.div 
            className="col-span-2 md:col-span-4 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-block mb-5 group">
              <img 
                src={nvmLogo} 
                alt="NVM News - Nhyiraba Viglio Media" 
                className="h-12 w-auto brightness-0 invert transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-white/60">
              Delivering trusted journalism and insightful analysis to readers worldwide since 2020.
            </p>
            {/* Social links with hover effects */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-all duration-300 ${social.color} hover:text-white hover:scale-110`}
                  aria-label={`Follow us on ${social.name}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* News links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Sections</h3>
            <ul className="space-y-3">
              {footerLinks.news.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="group text-sm hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="group text-sm hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="group text-sm hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div 
          className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} NVM News. All rights reserved.
          </p>
          <p className="text-sm text-white/50 flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-breaking fill-current" /> for truth and transparency
          </p>
        </motion.div>
      </div>
    </footer>
  );
}