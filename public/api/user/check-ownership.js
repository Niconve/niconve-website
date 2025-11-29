// ==============================================
// API: Check App Ownership
// ==============================================
const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../../utils/jwt');
const { getAuthToken } = require('../../utils/cookies');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { app_id } = req.query;

        if (!app_id) {
            return res.status(400).json({ 
                error: 'app_id harus diisi' 
            });
        }

        // Get user from token
        const token = getAuthToken(req);
        
        if (!token) {
            return res.status(200).json({ 
                owns_app: false,
                authenticated: false
            });
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(200).json({ 
                owns_app: false,
                authenticated: false
            });
        }

        // Check ownership in user_purchases table
        const { data: purchase, error } = await supabase
            .from('user_purchases')
            .select('*')
            .eq('user_id', decoded.userId)
            .eq('app_id', app_id)
            .eq('lifetime_access', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Check ownership error:', error);
            return res.status(500).json({ 
                error: 'Gagal memeriksa kepemilikan' 
            });
        }

        return res.status(200).json({
            success: true,
            owns_app: !!purchase,
            authenticated: true,
            purchase_date: purchase?.purchased_at || null
        });

    } catch (error) {
        console.error('Check ownership error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server' 
        });
    }
};
