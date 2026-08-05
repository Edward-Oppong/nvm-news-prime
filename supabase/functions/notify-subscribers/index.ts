import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyPayload {
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, slug, excerpt, image_url }: NotifyPayload = await req.json();

    if (!title || !slug) {
      return new Response(
        JSON.stringify({ error: "Missing required title or slug" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch active subscriber emails
    const { data: subscribers, error: dbError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .is("unsubscribed_at", null);

    if (dbError) {
      throw dbError;
    }

    const emails = (subscribers || []).map((s: { email: string }) => s.email).filter(Boolean);

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteOrigin = req.headers.get("origin") || "https://nvmnews.com";
    const articleUrl = `${siteOrigin}/article/${slug}`;
    const logoUrl = `${siteOrigin}/nvm-logo.png`;
    function escapeHtml(str: string = "") {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    const safeTitle = escapeHtml(title);
    const safeExcerpt = escapeHtml(excerpt || "Read the latest update on NVM News.");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background-color: #0f172a; padding: 24px; text-align: center; }
          .header img { height: 48px; width: auto; }
          .content { padding: 32px 28px; }
          .badge { display: inline-block; background: #e0e7ff; color: #3730a3; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
          .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.35; }
          .cover-img { width: 100%; max-height: 320px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
          .excerpt { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 28px; }
          .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .footer a { color: #475569; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="NVM News Logo" />
          </div>
          <div class="content">
            <span class="badge">New Story Alert</span>
            <h1 class="title">${safeTitle}</h1>
            ${image_url ? `<img src="${image_url}" alt="${title}" class="cover-img" />` : ""}
            <p class="excerpt">${safeExcerpt}</p>
            <div style="text-align: center;">
              <a href="${articleUrl}" class="btn" target="_blank">Read Full Article &rarr;</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NVM News — Nhyiraba Viglio Media. All rights reserved.</p>
            <p>You received this email because you subscribed to story updates on NVM News.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not provided. Email notification payload logged.");
      return new Response(
        JSON.stringify({
          success: true,
          message: `Notification prepared for ${emails.length} subscribers. Add RESEND_API_KEY to secrets to send live emails.`,
          subscribersCount: emails.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Resend Batch / Email API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NVM News <alerts@nvmnews.com>",
        to: emails,
        subject: `📰 New Story: ${title}`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    return new Response(
      JSON.stringify({ success: true, resendData, sentToCount: emails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
