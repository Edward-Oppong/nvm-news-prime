import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already subscribed', description: 'This email is already on our list.' });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({ title: 'Subscribed!', description: 'Welcome to the NVM newsletter.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="border-y border-divider bg-muted/40">
      <div className="container py-6 md:py-8">
        <motion.div
          className="flex flex-col md:flex-row items-center gap-4 md:gap-8"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-headline">Stay Informed</h3>
              <p className="text-sm text-muted-foreground">Get top stories delivered daily.</p>
            </div>
          </div>

          {isSubscribed ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle className="h-5 w-5" />
              You're subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 w-full md:max-w-md">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-full bg-background border-border/60"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full px-5"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
