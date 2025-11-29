// ==============================================
// API: User Login (with Rate Limiting)
// ==============================================
const { createClient } = require('@supabase/supabase-js');
const { comparePassword, validateEmail } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { setAuthCookie } = require('../../utils/cookies');
const { withRateLimit } = require('../../utils/rate-limit');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const handler = async (req, res) => {
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
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email dan password harus diisi' 
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ 
                error: 'Format email tidak valid' 
            });
        }

        // Get user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (userError || !user) {
            return res.status(401).json({ 
                error: 'Email atau password salah' 
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Email atau password salah' 
            });
        }

        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.is_admin
        });

        // Create session
        const { error: sessionError } = await supabase
            .from('user_sessions')
            .insert([{
                user_id: user.id,
                token,
                ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                user_agent: req.headers['user-agent'],
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                created_at: new Date().toISOString()
            }]);

        if (sessionError) {
            console.error('Session creation error:', sessionError);
        }

        // Set auth cookie
        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                email_verified: user.email_verified,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server. Silakan coba lagi.' 
        });
    }
};

module.exports = withRateLimit(handler, 'login');
