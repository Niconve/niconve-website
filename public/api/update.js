const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, file, icon, isPaid, price, description, releaseType, betaDuration, password } = req.body;

        // Verify admin password
        if (password !== adminPassword) {
            return res.status(401).json({ error: 'Password admin salah!' });
        }

        if (!id) {
            return res.status(400).json({ error: 'ID aplikasi wajib diisi!' });
        }

        // Get existing app data
        const { data: existingApp, error: fetchError } = await supabase
            .from('apps')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingApp) {
            return res.status(404).json({ error: 'Aplikasi tidak ditemukan!' });
        }

        const timestamp = Date.now();
        const updateFields = {
            updated_at: new Date().toISOString()
        };

        let newFileName = null;
        let newIconUrl = null;
        let filesToDelete = [];

        // Handle APK file update if provided
        if (file) {
            const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(400).json({ error: 'Format file APK tidak valid!' });
            }

            const fileBuffer = Buffer.from(matches[2], 'base64');
            newFileName = `${existingApp.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.apk`;

            // Upload new APK to storage
            const { error: uploadError } = await supabase
                .storage
                .from('apks')
                .upload(newFileName, fileBuffer, {
                    contentType: 'application/vnd.android.package-archive',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return res.status(500).json({ error: 'Gagal upload file APK baru: ' + uploadError.message });
            }

            // Get public URL for new file
            const { data: { publicUrl } } = supabase
                .storage
                .from('apks')
                .getPublicUrl(newFileName);

            updateFields.file_name = newFileName;
            updateFields.download_url = publicUrl;
            
            // Mark old APK for deletion
            if (existingApp.file_name) {
                filesToDelete.push(existingApp.file_name);
            }
        }

        // Handle icon update if provided
        if (icon) {
            const iconMatches = icon.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (iconMatches && iconMatches.length === 3) {
                const iconBuffer = Buffer.from(iconMatches[2], 'base64');
                const iconFileName = `${existingApp.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}_icon.png`;

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
                    
                    newIconUrl = iconPublicUrl;
                    updateFields.icon_url = iconPublicUrl;
                    
                    // Mark old icon for deletion
                    if (existingApp.icon_url) {
                        const oldIconFileName = existingApp.icon_url.split('/').pop();
                        if (oldIconFileName) {
                            filesToDelete.push(oldIconFileName);
                        }
                    }
                }
            }
        }

        // Handle pricing update
        if (isPaid !== undefined) {
            updateFields.is_paid = isPaid;
            updateFields.price = isPaid ? (parseFloat(price) || 0) : 0;
            updateFields.currency = 'IDR';
        }

        // Handle description update
        if (description !== undefined) {
            updateFields.description = description || null;
        }

        // Handle release type update
        if (releaseType !== undefined) {
            updateFields.release_type = releaseType;
            
            // Calculate beta end date if changing to beta
            if (releaseType === 'beta' && betaDuration) {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + parseInt(betaDuration));
                updateFields.beta_end_date = endDate.toISOString();
            } else if (releaseType === 'full') {
                // Clear beta_end_date if changing to full
                updateFields.beta_end_date = null;
            }
        }

        // Update database
        const { error: updateError } = await supabase
            .from('apps')
            .update(updateFields)
            .eq('id', id);

        if (updateError) {
            console.error('Database update error:', updateError);
            
            // Rollback: delete newly uploaded files
            if (newFileName) {
                await supabase.storage.from('apks').remove([newFileName]);
            }
            if (newIconUrl) {
                const newIconFileName = newIconUrl.split('/').pop();
                await supabase.storage.from('apks').remove([newIconFileName]);
            }
            
            return res.status(500).json({ error: 'Gagal update database: ' + updateError.message });
        }

        // Delete old files from storage after successful database update
        if (filesToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .storage
                .from('apks')
                .remove(filesToDelete);
            
            if (deleteError) {
                console.error('Warning: Failed to delete old files:', deleteError);
                // Don't fail the request if old file deletion fails
            }
        }

        res.status(200).json({ 
            success: true, 
            message: 'Aplikasi berhasil diupdate!',
            data: {
                id: id,
                name: existingApp.name,
                ...updateFields
            }
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan: ' + error.message });
    }
};
