import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all beta apps where beta_end_date has passed
    const now = new Date().toISOString();
    
    const { data: expiredBetaApps, error: fetchError } = await supabase
      .from('apps')
      .select('id, name, beta_end_date')
      .eq('release_type', 'beta')
      .lte('beta_end_date', now);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch beta apps: ' + fetchError.message });
    }

    if (!expiredBetaApps || expiredBetaApps.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No expired beta apps to convert',
        converted: 0
      });
    }

    // Convert expired beta apps to full release
    const appIds = expiredBetaApps.map(app => app.id);
    
    const { error: updateError } = await supabase
      .from('apps')
      .update({
        release_type: 'full',
        beta_end_date: null,
        updated_at: new Date().toISOString()
      })
      .in('id', appIds);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to convert beta apps: ' + updateError.message });
    }

    res.status(200).json({
      success: true,
      message: `Successfully converted ${expiredBetaApps.length} beta app(s) to full release`,
      converted: expiredBetaApps.length,
      apps: expiredBetaApps.map(app => ({ id: app.id, name: app.name }))
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
