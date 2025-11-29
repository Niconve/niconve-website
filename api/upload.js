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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, file, icon, isPaid, price, description, releaseType, betaDuration, password } = req.body;

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Password salah!' });
    }

    // Validate input
    if (!name || !file) {
      return res.status(400).json({ error: 'Nama aplikasi dan file APK wajib diisi!' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const fileName = `${timestamp}-${sanitizedName}.apk`;

    // Convert base64 to buffer
    const base64Data = file.split(',')[1] || file;
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload file to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from('apks')
      .upload(fileName, fileBuffer, {
        contentType: 'application/vnd.android.package-archive',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Gagal upload file: ' + uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('apks')
      .getPublicUrl(fileName);

    // Upload icon if provided
    let iconUrl = null;
    if (icon) {
      const iconFileName = `${timestamp}-${sanitizedName}-icon.png`;
      const iconBase64 = icon.split(',')[1] || icon;
      const iconBuffer = Buffer.from(iconBase64, 'base64');

      const { error: iconUploadError } = await supabase
        .storage
        .from('apks')
        .upload(iconFileName, iconBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (!iconUploadError) {
        const { data: { publicUrl: iconPublicUrl } } = supabase
          .storage
          .from('apks')
          .getPublicUrl(iconFileName);
        iconUrl = iconPublicUrl;
      }
    }

    // Calculate beta end date if beta release
    let betaEndDate = null;
    if (releaseType === 'beta' && betaDuration) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(betaDuration));
      betaEndDate = endDate.toISOString();
    }

    // Save metadata to database
    const { data: appData, error: dbError } = await supabase
      .from('apps')
      .insert([{
        name: name,
        file_name: fileName,
        download_url: publicUrl,
        icon_url: iconUrl,
        is_paid: isPaid || false,
        price: isPaid ? (parseFloat(price) || 0) : 0,
        currency: 'IDR',
        description: description || null,
        release_type: releaseType || 'full',
        beta_end_date: betaEndDate,
        upload_date: new Date().toISOString(),
        download_count: 0
      }])
      .select()
      .single();

    if (dbError) {
      // Rollback: delete uploaded file if database insert fails
      await supabase.storage.from('apks').remove([fileName]);
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Gagal menyimpan data: ' + dbError.message });
    }

    // Get total count
    const { count } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true });

    res.status(200).json({
      success: true,
      message: 'Aplikasi berhasil diupload!',
      app: appData,
      totalApps: count
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
