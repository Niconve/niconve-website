// ==============================================
// API: Admin Payment Management
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Verify admin access
        const token = getAuthToken(req);
        
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Check if user is admin
        const { data: user } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', decoded.userId)
            .single();

        if (!user || !user.is_admin) {
            return res.status(403).json({ error: 'Forbidden: Admin only' });
        }

        // GET: List all payments with filters
        if (req.method === 'GET') {
            const { 
                status, 
                search, 
                limit = 50, 
                offset = 0 
            } = req.query;

            let query = supabase
                .from('payments')
                .select(`
                    *,
                    apps:app_id (
                        id,
                        name,
                        icon_url
                    )
                `, { count: 'exact' });

            // Filter by status
            if (status && status !== 'all') {
                query = query.eq('payment_status', status);
            }

            // Search by email, name, or order_id
            if (search) {
                query = query.or(`buyer_email.ilike.%${search}%,buyer_name.ilike.%${search}%,order_id.ilike.%${search}%`);
            }

            // Pagination
            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data: payments, error, count } = await query;

            if (error) {
                console.error('Get payments error:', error);
                return res.status(500).json({ 
                    error: 'Gagal mengambil data pembayaran' 
                });
            }

            return res.status(200).json({
                success: true,
                payments: payments || [],
                total: count || 0,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        }

        // PATCH: Update payment status (manual verification)
        if (req.method === 'PATCH') {
            const { payment_id, status, transaction_id } = req.body;

            if (!payment_id || !status) {
                return res.status(400).json({ 
                    error: 'payment_id dan status harus diisi' 
                });
            }

            // Allowed statuses
            const allowedStatuses = ['pending', 'paid', 'failed', 'expired', 'refunded'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ 
                    error: `Status harus salah satu dari: ${allowedStatuses.join(', ')}` 
                });
            }

            // Update payment
            const updateData = {
                payment_status: status,
                updated_at: new Date().toISOString()
            };

            if (transaction_id) {
                updateData.transaction_id = transaction_id;
            }

            const { data, error } = await supabase
                .from('payments')
                .update(updateData)
                .eq('id', payment_id)
                .select()
                .single();

            if (error) {
                console.error('Update payment error:', error);
                return res.status(500).json({ 
                    error: 'Gagal mengupdate status pembayaran' 
                });
            }

            // Note: The trigger_grant_purchase_access trigger will automatically
            // create a user_purchases record if status is changed to 'paid'

            return res.status(200).json({
                success: true,
                message: `Status pembayaran berhasil diubah menjadi ${status}`,
                payment: data
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Admin payment error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server' 
        });
    }
};
