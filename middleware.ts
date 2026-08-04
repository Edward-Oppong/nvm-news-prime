export const config = {
    matcher: '/article/:slug*',
};

const BOT_UA = /facebookexternalhit|Twitterbot|WhatsApp|Slackbot|LinkedInBot|Discordbot|TelegramBot|Pinterest|SkypeUriPreview|Googlebot|bingbot/i;

export default function middleware(req: Request) {
    const ua = req.headers.get('user-agent') || '';
    const url = new URL(req.url);

    if (BOT_UA.test(ua)) {
        const match = url.pathname.match(/^\/article\/([^/]+)\/?$/);
        if (match) {
            const slug = match[1];
            const rewriteUrl = new URL('/api/meta', url);
            rewriteUrl.searchParams.set('slug', slug);
            return Response.redirect(rewriteUrl, 307);
        }
    }

    // not a bot — fall through to normal SPA
}