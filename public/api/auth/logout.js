// ==============================================
// API: User Logout
// ==============================================
const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../../utils/jwt');
const { getAuthToken, clearAuthCookie } = require('../../utils/cookies');

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
        // Get token from cookie
        const token = getAuthToken(req);

        if (token) {
            // Verify and decode token
            const decoded = verifyToken(token);
            
            if (decoded) {
                // Delete session from database
                await supabase
                    .from('user_sessions')
                    .delete()
                    .eq('token', token);
            }
        }

        // Clear auth cookie
        clearAuthCookie(res);

        return res.status(200).json({
            success: true,
            message: 'Logout berhasil'
        });

    } catch (error) {
        console.error('Logout error:', error);
        
        // Still clear cookie even if there's an error
        clearAuthCookie(res);
        
        return res.status(200).json({
            success: true,
            message: 'Logout berhasil'
        });
    }
};
