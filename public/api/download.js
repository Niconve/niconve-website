import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID aplikasi wajib diisi!' });
    }

    // Increment download count
    const { data, error } = await supabase
      .from('apps')
      .update({ download_count: supabase.rpc('increment_download_count', { app_id: id }) })
      .eq('id', id)
      .select()
      .single();

    // Alternative: manual increment
    const { data: appData } = await supabase
      .from('apps')
      .select('download_count')
      .eq('id', id)
      .single();

    if (appData) {
      await supabase
        .from('apps')
        .update({ download_count: (appData.download_count || 0) + 1 })
        .eq('id', id);
    }

    res.status(200).json({
      success: true,
      message: 'Download count updated'
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
