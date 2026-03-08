import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    // First delete related article_videos
    const { error: videosError } = await supabase
      .from('article_videos')
      .delete()
      .lt('created_at', cutoffDate);

    if (videosError) {
      console.error('Error deleting article videos:', videosError);
    }

    // Delete related article_images
    const { error: imagesError } = await supabase
      .from('article_images')
      .delete()
      .lt('created_at', cutoffDate);

    if (imagesError) {
      console.error('Error deleting article images:', imagesError);
    }

    // Delete articles older than 30 days
    const { data: deleted, error: articlesError } = await supabase
      .from('articles')
      .delete()
      .lt('created_at', cutoffDate)
      .select('id, title');

    if (articlesError) {
      console.error('Error deleting articles:', articlesError);
      return new Response(
        JSON.stringify({ error: articlesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const count = deleted?.length || 0;
    console.log(`Auto-deleted ${count} articles older than 30 days`);

    return new Response(
      JSON.stringify({ success: true, deleted_count: count, deleted_articles: deleted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Auto-delete error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
