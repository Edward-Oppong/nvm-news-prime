import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SITE_URL = 'https://www.nvmnews.com';
const SITE_NAME = 'NVM News';
const DEFAULT_DESCRIPTION =
    'Stay updated with breaking news from Ghana and around the world. Politics, business, sports, entertainment and trusted journalism.';
const DEFAULT_IMAGE = `${SITE_URL}/hero-general.jpg`;

function escapeHtml(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default async function handler(req: any, res: any) {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '';

    if (!slug) {
        res.status(400).send('Missing slug');
        return;
    }

    const pageUrl = `${SITE_URL}/article/${slug}`;

    let title = SITE_NAME;
    let description = DEFAULT_DESCRIPTION;
    let image = DEFAULT_IMAGE;

    try {
        const supabase = createClient(SUPABASE_URL as string, SUPABASE_PUBLISHABLE_KEY as string);

        const { data: article } = await supabase
            .from('articles')
            .select('title, excerpt, image_url')
            .eq('slug', slug)
            .eq('published', true)
            .maybeSingle();

        if (article) {
            title = article.title || title;
            description = article.excerpt || description;
            image = article.image_url || image;
        }
    } catch {
        // Fall back to defaults if the lookup fails — never break the preview entirely
    }

    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeImage = escapeHtml(image);
    const safeUrl = escapeHtml(pageUrl);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:image" content="${safeImage}" />
<meta property="og:url" content="${safeUrl}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
<meta name="twitter:image" content="${safeImage}" />

<meta http-equiv="refresh" content="0;url=${safeUrl}" />
</head>
<body>
<p>Redirecting to <a href="${safeUrl}">${safeTitle}</a>&hellip;</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
    res.status(200).send(html);
}