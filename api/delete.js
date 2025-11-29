import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, password } = req.body;

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Password salah!' });
    }

    // Validate input
    if (!id) {
      return res.status(400).json({ error: 'ID aplikasi wajib diisi!' });
    }

    // Get app data first to get filename
    const { data: appData, error: fetchError } = await supabase
      .from('apps')
      .select('file_name')
      .eq('id', id)
      .single();

    if (fetchError || !appData) {
      return res.status(404).json({ error: 'Aplikasi tidak ditemukan' });
    }

    // Delete file from storage
    const { error: storageError } = await supabase
      .storage
      .from('apks')
      .remove([appData.file_name]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue even if file deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Gagal menghapus data' });
    }

    // Get updated count
    const { count } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true });

    res.status(200).json({
      success: true,
      message: 'Aplikasi berhasil dihapus!',
      totalApps: count || 0
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
