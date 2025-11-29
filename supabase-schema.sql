-- ====================================
-- NICONVE DATABASE COMPLETE SCHEMA
-- Setup lengkap untuk Supabase Database
-- Includes: Apps + Payments + Analytics
-- ====================================

-- ====================================
-- 1. APPS TABLE (Main Application Data)
-- ====================================

CREATE TABLE IF NOT EXISTS public.apps (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    download_url TEXT NOT NULL,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns (safe to run multiple times)
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS release_type VARCHAR(20) DEFAULT 'full';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS beta_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

-- Add comments
COMMENT ON TABLE public.apps IS 'Main table storing all application data';
COMMENT ON COLUMN public.apps.description IS 'Optional description of the application (max 300 characters)';
COMMENT ON COLUMN public.apps.release_type IS 'Release type: full or beta';
COMMENT ON COLUMN public.apps.beta_end_date IS 'End date for beta release (auto-converts to full after this date)';
COMMENT ON COLUMN public.apps.purchase_count IS 'Number of successful purchases for paid apps';

-- ====================================
-- 2. PAYMENTS TABLE (Transaction Data)
-- ====================================

CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    -- Status: pending, paid, expired, failed, refunded
    order_id VARCHAR(255) UNIQUE NOT NULL,
    transaction_id VARCHAR(255),
    download_token VARCHAR(255) UNIQUE,
    token_expires_at TIMESTAMP,
    downloaded_at TIMESTAMP,
    midtrans_snap_token TEXT,
    payment_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add user_id column (safe to run multiple times)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE public.payments IS 'Stores all payment transactions for applications';
COMMENT ON COLUMN public.payments.payment_status IS 'Status pembayaran: pending (menunggu), paid (berhasil), expired (kedaluwarsa), failed (gagal), refunded (refund)';
COMMENT ON COLUMN public.payments.download_token IS 'Token unik untuk download setelah pembayaran berhasil, berlaku 24 jam';

-- ====================================
-- 3. INDEXES (For Better Performance)
-- ====================================

-- Apps table indexes
CREATE INDEX IF NOT EXISTS idx_apps_upload_date ON public.apps(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_apps_download_count ON public.apps(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_apps_beta_end_date ON public.apps(beta_end_date);
CREATE INDEX IF NOT EXISTS idx_apps_release_type ON public.apps(release_type);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_email ON public.payments(buyer_email);
CREATE INDEX IF NOT EXISTS idx_payments_token ON public.payments(download_token);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_app_id ON public.payments(app_id);

-- ====================================
-- 4. FUNCTIONS (Auto-update timestamps)
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 5. TRIGGERS (Auto-update on UPDATE)
-- ====================================

-- Apps table trigger
DROP TRIGGER IF EXISTS update_apps_updated_at ON public.apps;
CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON public.apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Payments table trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 6. VIEWS (Analytics & Reporting)
-- ====================================

CREATE OR REPLACE VIEW sales_analytics AS
SELECT 
    a.id as app_id,
    a.name as app_name,
    a.is_paid,
    a.price,
    a.currency,
    COUNT(p.id) as total_transactions,
    SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END) as total_revenue,
    COUNT(CASE WHEN p.payment_status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN p.payment_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN p.payment_status = 'failed' THEN 1 END) as failed_count
FROM public.apps a
LEFT JOIN public.payments p ON a.id = p.app_id
GROUP BY a.id, a.name, a.is_paid, a.price, a.currency;

COMMENT ON VIEW sales_analytics IS 'Analytics view for sales reports and revenue tracking';

-- ====================================
-- 7. ROW LEVEL SECURITY (Optional)
-- Uncomment untuk enable security
-- ====================================

-- Enable RLS
-- ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Public read access for apps
-- CREATE POLICY "Allow public read access" ON public.apps
--     FOR SELECT
--     USING (true);

-- Private read access for payments (admin only via service_role)
-- CREATE POLICY "Admin only access" ON public.payments
--     FOR ALL
--     USING (false);

-- ====================================
-- 8. VERIFICATION QUERIES
-- Run these to verify setup is correct
-- ====================================

-- Check apps table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'apps' 
-- ORDER BY ordinal_position;

-- Check payments table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'payments' 
-- ORDER BY ordinal_position;

-- Count total apps
-- SELECT COUNT(*) as total_apps FROM public.apps;

-- Count total payments
-- SELECT COUNT(*) as total_payments FROM public.payments;

-- View all apps
-- SELECT id, name, is_paid, price, release_type, download_count, purchase_count 
-- FROM public.apps 
-- ORDER BY upload_date DESC;

-- View sales analytics
-- SELECT * FROM sales_analytics WHERE is_paid = true;

-- ====================================
-- 9. SAMPLE DATA (Optional - for testing)
-- Uncomment to insert sample data
-- ====================================

-- INSERT INTO public.apps (name, file_name, download_url, is_paid, price, description, release_type) VALUES
-- ('Sample Free App', 'sample-free.apk', 'https://example.com/sample-free.apk', false, 0, 'A free sample application', 'full'),
-- ('Sample Paid App', 'sample-paid.apk', 'https://example.com/sample-paid.apk', true, 25000, 'A premium sample application', 'full'),
-- ('Sample Beta App', 'sample-beta.apk', 'https://example.com/sample-beta.apk', true, 15000, 'Beta version for testing', 'beta');

-- ====================================
-- SETUP COMPLETE! 🎉
-- ====================================
-- 
-- Next Steps:
-- 1. Copy entire SQL above
-- 2. Paste in Supabase SQL Editor
-- 3. Click "Run" (Ctrl+Enter)
-- 4. Verify success message
-- 5. Test your app!
-- ====================================
