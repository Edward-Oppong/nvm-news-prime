import { supabase } from '@/integrations/supabase/client';

const NON_CORE_ARTICLE_COLUMNS = [
  'author_name',
  'writer_name',
  'publisher_name',
  'title_font_size',
  'reviewed_by',
  'reviewed_by_name',
  'reviewed_at',
  'audio_url',
  'status',
  'submitted_at',
  'rejection_note',
];

/**
 * Safely inserts an article into Supabase.
 * If the remote Supabase database has not had the latest migration executed
 * (i.e. column missing in schema cache), it automatically strips the missing
 * column(s) and retries so publishing/saving never crashes.
 */
export async function safeInsertArticle(payload: Record<string, any>) {
  let curPayload = { ...payload };

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await supabase
      .from('articles')
      .insert([curPayload] as any)
      .select('id')
      .single();

    if (!res.error) {
      return res;
    }

    // Try extracting specific missing column name
    const match =
      res.error.message?.match(/Could not find the '(\w+)' column/i) ||
      res.error.message?.match(/column "(\w+)" of relation/i) ||
      res.error.message?.match(/column '(\w+)' does not exist/i);

    if (match && match[1] && match[1] in curPayload) {
      delete curPayload[match[1]];
      continue;
    }

    // Fallback: strip all non-core columns if schema error occurs
    if (
      res.error.code === 'PGRST204' ||
      res.error.code === '42703' ||
      res.error.message?.toLowerCase().includes('column') ||
      res.error.message?.toLowerCase().includes('schema cache')
    ) {
      let removedAny = false;
      for (const col of NON_CORE_ARTICLE_COLUMNS) {
        if (col in curPayload) {
          delete curPayload[col];
          removedAny = true;
        }
      }
      if (removedAny) continue;
    }

    return res;
  }

  return await supabase.from('articles').insert([curPayload] as any).select('id').single();
}

/**
 * Safely updates an article in Supabase with missing-column fallback.
 */
export async function safeUpdateArticle(id: string, payload: Record<string, any>) {
  let curPayload = { ...payload };

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await supabase
      .from('articles')
      .update(curPayload as any)
      .eq('id', id);

    if (!res.error) {
      return res;
    }

    const match =
      res.error.message?.match(/Could not find the '(\w+)' column/i) ||
      res.error.message?.match(/column "(\w+)" of relation/i) ||
      res.error.message?.match(/column '(\w+)' does not exist/i);

    if (match && match[1] && match[1] in curPayload) {
      delete curPayload[match[1]];
      continue;
    }

    if (
      res.error.code === 'PGRST204' ||
      res.error.code === '42703' ||
      res.error.message?.toLowerCase().includes('column') ||
      res.error.message?.toLowerCase().includes('schema cache')
    ) {
      let removedAny = false;
      for (const col of NON_CORE_ARTICLE_COLUMNS) {
        if (col in curPayload) {
          delete curPayload[col];
          removedAny = true;
        }
      }
      if (removedAny) continue;
    }

    return res;
  }

  return await supabase.from('articles').update(curPayload as any).eq('id', id);
}
