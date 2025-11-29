// ==============================================
// API: Get Analytics Stats
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

        // Get today's stats from view
        const { data: todayStats } = await supabase
            .from('today_stats')
            .select('*')
            .single();

        // Get popular pages from view
        const { data: popularPages } = await supabase
            .from('popular_pages')
            .select('*')
            .limit(10);

        // Get revenue analytics from view
        const { data: revenueStats } = await supabase
            .from('revenue_analytics')
            .select('*');

        // Get device breakdown (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: deviceBreakdown } = await supabase
            .from('page_visits')
            .select('device_type')
            .gte('visited_at', sevenDaysAgo.toISOString());

        // Count device types
        const deviceCounts = {
            mobile: 0,
            tablet: 0,
            desktop: 0,
            unknown: 0
        };

        deviceBreakdown?.forEach(visit => {
            const type = visit.device_type || 'unknown';
            deviceCounts[type] = (deviceCounts[type] || 0) + 1;
        });

        // Get browser breakdown
        const { data: browserBreakdown } = await supabase
            .from('page_visits')
            .select('browser')
            .gte('visited_at', sevenDaysAgo.toISOString());

        const browserCounts = {};
        browserBreakdown?.forEach(visit => {
            const browser = visit.browser || 'Unknown';
            browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        });

        // Get traffic trend (last 7 days)
        const { data: trafficTrend } = await supabase
            .from('visitor_analytics')
            .select('*')
            .gte('date', sevenDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: true });

        return res.status(200).json({
            success: true,
            today: todayStats || {
                total_visits: 0,
                unique_visitors: 0,
                guest_visits: 0,
                user_visits: 0
            },
            popular_pages: popularPages || [],
            revenue: revenueStats || [],
            device_breakdown: deviceCounts,
            browser_breakdown: browserCounts,
            traffic_trend: trafficTrend || []
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return res.status(500).json({ 
            error: 'Terjadi kesalahan server' 
        });
    }
};
