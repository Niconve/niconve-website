// ==============================================
// API: Track Page Visit (Analytics)
// ==============================================
const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../../utils/jwt');
const { getAuthToken } = require('../../utils/cookies');
const { parseUserAgent, getDeviceType } = require('../../utils/user-agent');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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
        const { 
            page_url, 
            page_title, 
            referrer, 
            session_id,
            visit_duration 
        } = req.body;

        if (!page_url || !session_id) {
            return res.status(400).json({ 
                error: 'page_url dan session_id harus diisi' 
            });
        }

        // Get user info from token (if logged in)
        const token = getAuthToken(req);
        let userId = null;
        
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                userId = decoded.userId;
            }
        }

        // Parse user agent
        const userAgent = req.headers['user-agent'] || '';
        const uaInfo = parseUserAgent(userAgent);
        const deviceType = getDeviceType(userAgent);

        // Get IP address
        const ipAddress = req.headers['x-forwarded-for'] || 
                         req.headers['x-real-ip'] || 
                         req.connection.remoteAddress || 
                         'unknown';

        // Insert page visit
        const { data, error } = await supabase
            .from('page_visits')
            .insert([{
                user_id: userId,
                session_id,
                page_url,
                page_title: page_title || page_url,
                referrer: referrer || null,
                ip_address: ipAddress,
                user_agent: userAgent,
                device_type: deviceType,
                browser: uaInfo.browser.name || 'Unknown',
                browser_version: uaInfo.browser.version || null,
                os: uaInfo.os.name || 'Unknown',
                os_version: uaInfo.os.version || null,
                visit_duration: visit_duration || 0,
                visited_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Track visit error:', error);
            return res.status(500).json({ 
                error: 'Gagal menyimpan tracking data' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Visit tracked successfully',
            visit_id: data.id
        });

    } catch (error) {
        console.error('Track error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server' 
        });
    }
};
