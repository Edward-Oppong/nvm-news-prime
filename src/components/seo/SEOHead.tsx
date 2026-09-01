import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publisher?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  schemaData?: Record<string, any>;
}

export function SEOHead({
  title,
  description = 'Stay updated with the latest Ghana news, politics, business, entertainment, sports and world news from NVM News.',
  keywords = 'Ghana News, Breaking News, Politics, Business, Entertainment, Sports, Africa, NVM News',
  image = 'https://nvmnews.com/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://nvmnews.com/',
  type = 'website',
  author = 'NVM News',
  publisher = 'NVM News Network',
  publishedTime,
  modifiedTime,
  section,
  schemaData,
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title.includes('NVM News') ? title : `${title} | NVM News`;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set canonical URL
    const setCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Core SEO Meta
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'author', author);
    setMeta('name', 'publisher', publisher);
    setCanonical(url);

    // OpenGraph (Facebook, WhatsApp, LinkedIn)
    setMeta('property', 'og:site_name', 'NVM News');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url);

    if (type === 'article') {
      if (publishedTime) setMeta('property', 'article:published_time', publishedTime);
      if (modifiedTime) setMeta('property', 'article:modified_time', modifiedTime);
      if (section) setMeta('property', 'article:section', section);
      if (author) setMeta('property', 'article:author', author);
    }

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@nvmnews');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // JSON-LD Structured Data Schema (Google News & Rich Results)
    const jsonLdId = 'nvm-seo-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultSchema =
      type === 'article'
        ? {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': url,
            },
            headline: title,
            image: [image],
            datePublished: publishedTime || new Date().toISOString(),
            dateModified: modifiedTime || publishedTime || new Date().toISOString(),
            author: [
              {
                '@type': 'Person',
                name: author,
              },
            ],
            publisher: {
              '@type': 'Organization',
              name: publisher || 'NVM News Network',
              logo: {
                '@type': 'ImageObject',
                url: 'https://nvmnews.com/nvm-logo.png',
              },
            },
            description: description,
          }
        : {
            '@context': 'https://schema.org',
            '@type': 'NewsMediaOrganization',
            name: 'NVM News',
            url: 'https://nvmnews.com',
            logo: 'https://nvmnews.com/nvm-logo.png',
            sameAs: [
              'https://twitter.com/nvmnews',
              'https://facebook.com/nvmnews',
            ],
          };

    scriptTag.text = JSON.stringify(schemaData || defaultSchema);

    return () => {
      // Clean up dynamic meta if needed
    };
  }, [title, description, keywords, image, url, type, author, publisher, publishedTime, modifiedTime, section, schemaData]);

  return null;
}
