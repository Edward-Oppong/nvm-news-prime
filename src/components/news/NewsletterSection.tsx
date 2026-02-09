import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Loader2, Sparkles, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });

    setIsSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast.info('You\'re already subscribed!');
        setIsSubmitted(true);
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
      return;
    }

    setIsSubmitted(true);
    toast.success('Welcome to NVM News!');
  };

  const trustIndicators = [
    { icon: Users, text: '250K+ readers' },
    { icon: Mail, text: 'Daily digest' },
    { icon: Shield, text: 'No spam, ever' },
  ];

  return (
    <section className="py-20 md:py-28 bg-headline relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon with pulse effect */}
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-8 relative"
            whileHover={{ scale: 1.05 }}
          >
            <Mail className="h-10 w-10 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Title with gradient */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4">
            Stay Informed,{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Stay Ahead
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join over 250,000 readers who start their day with NVM News. Get the stories that matter, 
            delivered directly to your inbox every morning.
          </p>

          {/* Form */}
          {!isSubmitted ? (
            <motion.form 
              onSubmit={handleSubmit} 
              className="max-w-lg mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div 
                className={`flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 border transition-all duration-300 ${
                  isFocused ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/20'
                }`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-transparent text-white placeholder:text-white/50 focus:outline-none text-base"
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-success/20 text-success mb-8"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">Thank you for subscribing!</span>
              <Sparkles className="h-5 w-5" />
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {trustIndicators.map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2 text-white/60"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
