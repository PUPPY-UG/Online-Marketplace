// UniTrade Campus Online Marketplace - Email Notification Service
// Uganda Christian University (UCU)

const nodemailer = require('nodemailer');
const db = require('../config/db');

class EmailService {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST || '';
    this.smtpPort = Number(process.env.SMTP_PORT) || 587;
    this.smtpUser = process.env.SMTP_USER || '';
    this.smtpPass = process.env.SMTP_PASS || '';
    this.fromAddress = process.env.SMTP_FROM || '"UniTrade UCU Campus Marketplace" <alerts@unitrade.ucu.ac.ug>';

    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (this.smtpHost && this.smtpUser && this.smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpPort === 465,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass
        }
      });
      console.log(`[UniTrade Email] SMTP Transporter configured (${this.smtpHost}:${this.smtpPort})`);
    } else {
      console.log('[UniTrade Email] Live SMTP credentials not detected. Active Academic Simulation & Audit Mode.');
    }
  }

  /**
   * Send general email and record in database audit log
   */
  async sendEmail({ to, subject, text, html, orderId = null, notificationType = 'SYSTEM' }) {
    if (!to) {
      throw new Error('Recipient email is required.');
    }

    // 1. Prevent duplicate notifications for the same order and notification type
    if (orderId && notificationType) {
      const [existing] = await db.query(
        'SELECT id FROM email_notifications WHERE order_id = ? AND notification_type = ? AND delivery_status = "Sent"',
        [orderId, notificationType]
      );
      if (existing && existing.length > 0) {
        console.log(`[UniTrade Email] Duplicate notification suppressed for Order #${orderId} (${notificationType}) to ${to}`);
        return {
          success: true,
          duplicateSuppressed: true,
          message: 'Notification previously delivered. Duplicate sending prevented.'
        };
      }
    }

    let deliveryStatus = 'Sent';
    let errorMessage = null;

    // 2. Real SMTP transmission if configured
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to,
          subject,
          text,
          html: html || text.replace(/\n/g, '<br>')
        });
        console.log(`[UniTrade Email] Real SMTP email delivered to ${to} [${subject}]`);
      } catch (err) {
        console.error(`[UniTrade Email] SMTP Delivery Failed to ${to}:`, err.message);
        deliveryStatus = 'Failed';
        errorMessage = err.message;
      }
    } else {
      // 3. Simulated academic mode: Log transparently for evaluation
      console.log('\n=================== [UNITRADE EMAIL DISPATCH] ===================');
      console.log(`To: ${to}`);
      console.log(`From: ${this.fromAddress}`);
      console.log(`Type: ${notificationType} | Order ID: ${orderId || 'N/A'}`);
      console.log(`Subject: ${subject}`);
      console.log('--------------------------- CONTENT -----------------------------');
      console.log(text);
      console.log('=================================================================\n');
    }

    // 4. Save notification log into database
    try {
      await db.query(
        'INSERT INTO email_notifications (order_id, recipient_email, notification_type, delivery_status, error_message) VALUES (?, ?, ?, ?, ?)',
        [orderId, to, notificationType, deliveryStatus, errorMessage]
      );
    } catch (dbErr) {
      console.error('[UniTrade Email] Failed to record email audit log in DB:', dbErr.message);
    }

    return {
      success: deliveryStatus === 'Sent',
      deliveryStatus,
      errorMessage,
      to,
      subject
    };
  }

  /**
   * Send automatic notification when order status reaches READY FOR PICKUP
   * Strictly adheres to the required academic format
   */
  async sendReadyForPickupEmail({ order, buyerName, buyerEmail, sellerName, pickupLocation, totalAmount, orderRef, itemsSummary }) {
    const subject = 'Your UniTrade Order Is Ready for Pickup!';

    const text = 
`Hello ${buyerName || 'Valued Buyer'},

Good news! Your UniTrade order is now ready for pickup.

Order Details:
- Order Reference: ${orderRef || order?.order_ref || order?.id}
- Product(s): ${itemsSummary || 'Campus Marketplace Item(s)'}
- Total Amount: UGX ${Number(totalAmount || order?.total_amount || 0).toLocaleString('en-UG')}
- Pickup Location: ${pickupLocation || order?.pickup_location || 'Campus Agreed Location'}
- Seller: ${sellerName || 'Campus Student Seller'}
- Order Status: Ready for Pickup

Please arrange with the seller to collect your order at the agreed campus pickup location.

After collecting your item, log in to UniTrade and click the CONFIRM PICKUP button to complete your order.

Thank you for using UniTrade – Campus Marketplace.

Buy Smart. Sell Easy. Trade Within Your Campus.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0f172a;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Uni<span style="color: #f97316;">Trade</span></h1>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Uganda Christian University (UCU) Campus Marketplace</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">Hello <strong>${buyerName || 'Valued Buyer'}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.5; color: #047857; font-weight: 600;">Good news! Your UniTrade order is now ready for pickup.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Order Details:</h3>
          <ul style="list-style: none; padding-left: 0; margin-bottom: 0; font-size: 14px; line-height: 1.8;">
            <li><strong>Order Reference:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${orderRef || order?.order_ref || order?.id}</span></li>
            <li><strong>Product(s):</strong> ${itemsSummary || 'Campus Marketplace Item(s)'}</li>
            <li><strong>Total Amount:</strong> UGX ${Number(totalAmount || order?.total_amount || 0).toLocaleString('en-UG')}</li>
            <li><strong>Pickup Location:</strong> 📍 ${pickupLocation || order?.pickup_location || 'Campus Agreed Location'}</li>
            <li><strong>Seller:</strong> ${sellerName || 'Campus Student Seller'}</li>
            <li><strong>Order Status:</strong> <span style="color: #0284c7; font-weight: bold;">Ready for Pickup</span></li>
          </ul>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Please arrange with the seller to collect your order at the agreed campus pickup location.
        </p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 13px; color: #1e40af; font-weight: 600;">
            After collecting your item, log in to UniTrade and click the <strong>CONFIRM PICKUP</strong> button to complete your order.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #475569; margin-top: 24px;">Thank you for using UniTrade – Campus Marketplace.</p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0; font-weight: 600; color: #64748b;">Buy Smart. Sell Easy. Trade Within Your Campus.</p>
          <p style="margin: 4px 0 0 0;">Uganda Christian University, Mukono Campus</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: buyerEmail || order?.buyer_email,
      subject,
      text,
      html,
      orderId: order?.id,
      notificationType: 'READY_FOR_PICKUP'
    });
  }

  /**
   * Send One-Time Password (OTP) verification code
   */
  async sendOTPEmail({ email, fullName, otp }) {
    const subject = `Your UniTrade Verification Code: ${otp}`;
    const text = 
`Hello ${fullName || 'Student'},

Your UniTrade campus marketplace one-time verification code (OTP) is:

    ${otp}

This code will expire in 10 minutes. 

Do not share this code with anyone. UniTrade administrators will never ask for your verification code.

Buy Smart. Sell Easy. Trade Within Your Campus.
Uganda Christian University (UCU)`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; text-align: center;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Uni<span style="color: #f97316;">Trade</span></h1>
        <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Uganda Christian University (UCU)</p>
        
        <h2 style="font-size: 18px; color: #1e293b; margin-top: 24px;">Your Verification Code (OTP)</h2>
        <p style="font-size: 14px; color: #475569;">Enter this code to access your UniTrade campus account:</p>
        
        <div style="background-color: #f1f5f9; padding: 18px; border-radius: 8px; font-size: 32px; font-family: monospace; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 20px 0;">
          ${otp}
        </div>
        
        <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="font-size: 11px; color: #94a3b8;">Do not share this code with anyone. UniTrade staff will never ask for your code.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
      orderId: null,
      notificationType: 'OTP'
    });
  }
}

module.exports = new EmailService();
