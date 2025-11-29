// ==============================================
// API: Get Current User
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
        // Get token from cookie
        const token = getAuthToken(req);

        if (!token) {
            return res.status(401).json({ 
                error: 'Not authenticated',
                authenticated: false
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ 
                error: 'Invalid or expired token',
                authenticated: false
            });
        }

        // Get user from database
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name, email, email_verified, is_admin, avatar_url, created_at, last_login')
            .eq('id', decoded.userId)
            .single();

        if (userError || !user) {
            return res.status(401).json({ 
                error: 'User not found',
                authenticated: false
            });
        }

        // Get purchase count
        const { count: purchaseCount } = await supabase
            .from('user_purchases')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        return res.status(200).json({
            success: true,
            authenticated: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                email_verified: user.email_verified,
                is_admin: user.is_admin,
                avatar_url: user.avatar_url,
                created_at: user.created_at,
                last_login: user.last_login,
                purchase_count: purchaseCount || 0
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server',
            authenticated: false
        });
    }
};
