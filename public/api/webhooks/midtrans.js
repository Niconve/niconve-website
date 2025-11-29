import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize Midtrans API Client
const apiClient = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default async function handler(req, res) {
  // Only allow POST (Midtrans sends webhook via POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notification = req.body;

    // Verify notification signature from Midtrans
    const { order_id, status_code, gross_amount, signature_key } = notification;
    
    // Generate expected signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    // Verify signature
    if (signature_key !== expectedSignature) {
      console.error('Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Get transaction status from Midtrans
    const transactionStatus = await apiClient.transaction.notification(notification);
    
    const orderId = transactionStatus.order_id;
    const transactionStatusCode = transactionStatus.transaction_status;
    const fraudStatus = transactionStatus.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatusCode}. Fraud status: ${fraudStatus}`);

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', orderId);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Determine payment status based on Midtrans response
    let paymentStatus = 'pending';
    let shouldNotify = false;

    if (transactionStatusCode === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'verified';
        shouldNotify = true;
      } else if (fraudStatus === 'challenge') {
        paymentStatus = 'pending';
      }
    } else if (transactionStatusCode === 'settlement') {
      paymentStatus = 'verified';
      shouldNotify = true;
    } else if (transactionStatusCode === 'pending') {
      paymentStatus = 'pending';
    } else if (transactionStatusCode === 'deny' || transactionStatusCode === 'expire' || transactionStatusCode === 'cancel') {
      paymentStatus = 'failed';
    }

    // Update payment status in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: paymentStatus,
        midtrans_transaction_status: transactionStatusCode,
        midtrans_fraud_status: fraudStatus,
        payment_verified_at: (paymentStatus === 'verified') ? new Date().toISOString() : null,
        midtrans_response: transactionStatus,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      return res.status(500).json({ error: 'Failed to update payment' });
    }

    // If payment is verified, create purchase record (if user exists)
    if (paymentStatus === 'verified' && payment.user_id) {
      // Check if purchase already exists
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', payment.user_id)
        .eq('app_id', payment.app_id)
        .single();

      if (!existingPurchase) {
        // Create new purchase record
        await supabase
          .from('purchases')
          .insert([{
            user_id: payment.user_id,
            app_id: payment.app_id,
            payment_id: payment.id,
            purchased_at: new Date().toISOString()
          }]);
      }

      // TODO: Send email notification to buyer
      // This should be implemented with your email service (SendGrid, AWS SES, etc.)
      console.log(`Payment verified for ${payment.buyer_email}. Email notification should be sent.`);
    }

    // Return success response to Midtrans
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      order_id: orderId,
      status: paymentStatus
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      error: 'Failed to process webhook',
      details: error.message
    });
  }
}
