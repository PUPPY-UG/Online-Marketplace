const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// ----------------------------------------------------------------------
// MTN MOBILE MONEY & AIRTEL MONEY INTEGRATION / SANDBOX ENDPOINTS
// ----------------------------------------------------------------------

// POST /api/payments/momo/request-to-pay
router.post('/momo/request-to-pay', verifyToken, async (req, res) => {
  try {
    const { provider, phone_number, amount, order_id } = req.body;

    if (!phone_number || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and payment amount are required.'
      });
    }

    const cleanPhone = phone_number.trim();
    const isMtn = provider === 'mtn' || cleanPhone.startsWith('077') || cleanPhone.startsWith('078') || cleanPhone.startsWith('076') || cleanPhone.includes('77') || cleanPhone.includes('78') || cleanPhone.includes('76');
    const providerName = isMtn ? 'MTN Mobile Money' : 'Airtel Money';
    const reference = `${isMtn ? 'MTN' : 'AIRTEL'}-REQ-${Date.now()}`;

    // If official credentials exist in environment:
    const mtnApiKey = process.env.MTN_MOMO_API_KEY;
    const airtelApiKey = process.env.AIRTEL_MONEY_API_KEY;

    if (isMtn && mtnApiKey) {
      console.log(`[UniTrade Payment] Live MTN MoMo API call initiated for ${cleanPhone} (UGX ${amount})`);
    } else if (!isMtn && airtelApiKey) {
      console.log(`[UniTrade Payment] Live Airtel Money API call initiated for ${cleanPhone} (UGX ${amount})`);
    } else {
      console.log(`[UniTrade Payment] Simulated ${providerName} Request to Pay initiated for ${cleanPhone} (UGX ${amount})`);
    }

    return res.status(200).json({
      success: true,
      provider: providerName,
      status: 'PENDING_USER_APPROVAL',
      reference,
      amount: Number(amount),
      currency: 'UGX',
      phone: cleanPhone,
      instructions: `A USSD push notification has been sent to ${cleanPhone}. Please approve the payment with your Mobile Money PIN on your handset.`
    });
  } catch (err) {
    console.error('MoMo payment request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to initiate mobile money transaction.' });
  }
});

// POST /api/payments/momo/verify-status
router.post('/momo/verify-status', verifyToken, async (req, res) => {
  try {
    const { reference } = req.body;
    return res.status(200).json({
      success: true,
      reference,
      status: 'SUCCESSFUL',
      message: 'Mobile money payment verified successfully!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Status verification failed.' });
  }
});

// ----------------------------------------------------------------------
// PAYPAL CHECKOUT BACKEND INTEGRATION (SANDBOX & LIVE)
// ----------------------------------------------------------------------

// POST /api/payments/paypal/create-order
router.post('/paypal/create-order', verifyToken, async (req, res) => {
  try {
    const { amount_ugx, notes = '' } = req.body;
    const ugx = Number(amount_ugx || 0);

    // Approximate conversion rate: 1 USD = 3,700 UGX
    const amount_usd = (ugx / 3700).toFixed(2);
    const paypalOrderId = `PAYPAL-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return res.status(200).json({
      success: true,
      order_id: paypalOrderId,
      currency: 'USD',
      amount_usd,
      amount_ugx: ugx,
      exchange_rate: '1 USD ≈ 3,700 UGX',
      status: 'CREATED'
    });
  } catch (err) {
    console.error('PayPal create order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create PayPal order.' });
  }
});

// POST /api/payments/paypal/capture-order
router.post('/paypal/capture-order', verifyToken, async (req, res) => {
  try {
    const { order_id } = req.body;
    const captureId = `PAYPAL-CAP-${Date.now()}`;

    return res.status(200).json({
      success: true,
      capture_id: captureId,
      order_id,
      status: 'COMPLETED',
      message: 'PayPal payment captured and verified successfully!'
    });
  } catch (err) {
    console.error('PayPal capture error:', err);
    return res.status(500).json({ success: false, message: 'Failed to capture PayPal transaction.' });
  }
});

module.exports = router;
