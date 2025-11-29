import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { app_id, buyer_name, buyer_email, payment_method, user_id } = req.body;

    // Validation
    if (!app_id || !buyer_name || !buyer_email || !payment_method) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['app_id', 'buyer_name', 'buyer_email', 'payment_method']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyer_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get app details
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('*')
      .eq('id', app_id)
      .single();

    if (appError || !app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Check if app is paid
    if (!app.is_paid) {
      return res.status(400).json({ error: 'This app is free' });
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Generate download token (valid for 24 hours)
    const downloadToken = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    // Create payment record
    const paymentRecord = {
      app_id: app.id,
      buyer_name: buyer_name,
      buyer_email: buyer_email,
      amount: app.price,
      currency: app.currency || 'IDR',
      payment_method: payment_method,
      payment_status: 'pending',
      order_id: orderId,
      download_token: downloadToken,
      token_expires_at: tokenExpiresAt.toISOString()
    };
    
    // Add user_id if provided (logged in user)
    if (user_id) {
      paymentRecord.user_id = user_id;
    }
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentRecord])
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return res.status(500).json({ error: 'Failed to create payment' });
    }

    // REAL MIDTRANS INTEGRATION
    try {
      // Prepare Midtrans transaction parameters
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: app.price
        },
        customer_details: {
          first_name: buyer_name,
          email: buyer_email
        },
        item_details: [{
          id: app.id,
          price: app.price,
          quantity: 1,
          name: app.name,
          category: 'Application',
          merchant_name: 'Niconve'
        }],
        enabled_payments: [
          'credit_card', 
          'gopay', 
          'shopeepay',
          'other_qris',
          'bca_va',
          'bni_va',
          'bri_va',
          'permata_va',
          'other_va',
          'echannel',
          'alfamart',
          'indomaret'
        ],
        callbacks: {
          finish: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard.html?payment=success&order_id=${orderId}`,
          error: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout.html?payment=error&order_id=${orderId}`,
          pending: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard.html?payment=pending&order_id=${orderId}`
        }
      };

      // Create Snap transaction
      const transaction = await snap.createTransaction(parameter);
      
      // Update payment record with Midtrans data
      await supabase
        .from('payments')
        .update({ 
          midtrans_snap_token: transaction.token,
          payment_url: transaction.redirect_url,
          midtrans_response: transaction
        })
        .eq('id', payment.id);

      // Return success response with real payment URL
      return res.status(200).json({
        success: true,
        order_id: orderId,
        payment_id: payment.id,
        amount: app.price,
        currency: app.currency || 'IDR',
        app_name: app.name,
        buyer_email: buyer_email,
        snap_token: transaction.token,
        payment_url: transaction.redirect_url,
        message: 'Payment created successfully! Redirecting to payment page...'
      });

    } catch (midtransError) {
      console.error('Midtrans integration error:', midtransError);
      
      // If Midtrans fails, still return the payment record but with error status
      await supabase
        .from('payments')
        .update({ 
          payment_status: 'failed',
          error_message: midtransError.message 
        })
        .eq('id', payment.id);

      return res.status(500).json({
        error: 'Failed to create payment gateway',
        details: midtransError.message,
        order_id: orderId
      });
    }

  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
