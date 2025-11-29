// ==============================================
// API: Get User Purchase History
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
        // Get user from token
        const token = getAuthToken(req);
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                authenticated: false
            });
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                error: 'Invalid token',
                authenticated: false
            });
        }

        // Get purchases with app details using view
        const { data: purchases, error } = await supabase
            .from('user_purchase_summary')
            .select('*')
            .eq('user_id', decoded.userId)
            .order('purchased_at', { ascending: false });

        if (error) {
            console.error('Get purchases error:', error);
            return res.status(500).json({ 
                error: 'Gagal mengambil data pembelian' 
            });
        }

        return res.status(200).json({
            success: true,
            purchases: purchases || [],
            total_purchases: purchases?.length || 0
        });

    } catch (error) {
        console.error('Get purchases error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server' 
        });
    }
};
