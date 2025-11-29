// ==============================================
// API: User Registration (with Rate Limiting)
// ==============================================
const { createClient } = require('@supabase/supabase-js');
const { hashPassword, validatePassword, validateEmail } = require('../../utils/password');
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
        const { name, email, password } = req.body;

        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Nama, email, dan password harus diisi' 
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ 
                error: 'Format email tidak valid' 
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: passwordValidation.error 
            });
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(400).json({ 
                error: 'Email sudah terdaftar' 
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                name,
                email: email.toLowerCase(),
                password_hash: hashedPassword,
                email_verified: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (createError) {
            console.error('Create user error:', createError);
            return res.status(500).json({ 
                error: 'Gagal membuat akun. Silakan coba lagi.' 
            });
        }

        // Generate JWT token
        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name
        });

        // Create session
        const { error: sessionError } = await supabase
            .from('user_sessions')
            .insert([{
                user_id: newUser.id,
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

        return res.status(201).json({
            success: true,
            message: 'Akun berhasil dibuat!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                email_verified: newUser.email_verified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server. Silakan coba lagi.' 
        });
    }
};

module.exports = withRateLimit(handler, 'register');
