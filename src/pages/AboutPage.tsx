import { motion } from 'framer-motion';
import { Users, Award, Globe, Heart } from 'lucide-react';
import { Header } from '@/components/news/Header';
import { Footer } from '@/components/news/Footer';


const stats = [
  { label: 'Daily Readers', value: '2.5M+' },
  { label: 'Countries Reached', value: '180+' },
  { label: 'Years of Excellence', value: '5+' },
  { label: 'Award-Winning Stories', value: '500+' },
];

const values = [
  {
    icon: Award,
    title: 'Truth & Accuracy',
    description: 'We are committed to factual, well-researched journalism that our readers can trust.',
  },
  {
    icon: Users,
    title: 'Independence',
    description: 'Our editorial decisions are made free from political or commercial influence.',
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    description: 'We cover stories that matter from every corner of the world with local expertise.',
  },
  {
    icon: Heart,
    title: 'Community First',
    description: 'We serve our readers and communities, giving voice to the voiceless.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="headline-xl mb-6">About NVM News</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Founded in 2020, NVM News has grown to become one of the most trusted sources 
                for breaking news, in-depth analysis, and thought-provoking journalism. 
                Our mission is to inform, inspire, and empower our readers with the stories that shape our world.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-b border-divider">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-headline text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-headline mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-3xl">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-headline text-center mb-8">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-foreground">
              <p>
                NVM News was born from a simple belief: that quality journalism matters. In an era of 
                information overload and misinformation, we saw the need for a news platform that 
                prioritizes accuracy, depth, and reader trust above all else.
              </p>
              <p>
                What started as a small team of passionate journalists has grown into a global 
                newsroom with correspondents in major cities around the world. But no matter how 
                much we grow, our core mission remains the same: to deliver the stories that matter, 
                told with integrity and insight.
              </p>
              <p>
                Every day, our reporters and editors work tirelessly to bring you breaking news, 
                investigative reports, and thoughtful analysis. We believe that an informed citizenry 
                is the foundation of a healthy democracy, and we're proud to play our part in 
                keeping the public informed.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
