import { config } from '../config/config.js';

// Base HTML email template builder
const wrapHtmlEmail = ({ title, preheader = '', contentHtml, actionButton = null }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }
    .container { max-width: 580px; margin: 30px auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .logo-badge { display: inline-block; background: #fbbf24; color: #020617; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; padding: 6px 16px; border-radius: 9999px; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.3; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #cbd5e1; }
    .card { background-color: #1e293b; border-radius: 14px; border: 1px solid #334155; padding: 20px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #94a3b8; font-size: 13px; }
    .card-value { color: #f8fafc; font-weight: 600; font-size: 13px; }
    .btn-container { text-align: center; margin: 28px 0 12px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617 !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; }
    .footer { background-color: #020617; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    .highlight { color: #fbbf24; font-weight: 600; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <div class="logo-badge">Barabar Shop</div>
      <h1 class="title">${title}</h1>
    </div>
    <div class="content">
      ${contentHtml}
      ${
        actionButton
          ? `<div class="btn-container">
               <a href="${actionButton.url}" class="btn">${actionButton.label}</a>
             </div>`
          : ''
      }
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px;">Barabar Shop Management & Booking System</p>
      <p style="margin: 0;">Automated notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    return { delivered: false, reason: 'No recipient email provided' };
  }

  // Check if SMTP credentials are provided
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: config.mailFrom,
        to,
        subject,
        text,
        html: html || text,
      });

      console.log(`📧 [EMAIL DELIVERED] To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
      return { delivered: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`⚠️ [SMTP ERROR] Failed to deliver real email via SMTP: ${err.message}. Falling back to logger.`);
    }
  }

  // Graceful fallback for development / simulated mode
  console.log('\n======================================================');
  console.log('📧 [EMAIL NOTIFICATION SIMULATION]');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From:    ${config.mailFrom}`);
  console.log('------------------------------------------------------');
  console.log(text);
  console.log('======================================================\n');

  return { delivered: false, simulated: true };
};

const formatEmailDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

// 1. Password Reset Email
export const sendPasswordResetEmail = async ({ to, resetUrl, userName }) => {
  const subject = 'Reset your Barabar Shop Password';
  const text = `Hello ${userName || 'there'},\n\nUse this link to reset your Barabar Shop password: ${resetUrl}\n\nThis link is valid for 15 minutes.\n\nIf you did not request this change, please ignore this email.`;
  const html = wrapHtmlEmail({
    title: 'Password Reset Request',
    preheader: 'Use this secure link to reset your account password',
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'there'}</strong>,</p>
      <p>We received a request to reset your password for your Barabar Shop account. Click the button below to choose a new password.</p>
      <p style="color: #94a3b8; font-size: 13px;">⚠️ This link will expire in <strong>15 minutes</strong> for your security.</p>
    `,
    actionButton: {
      url: resetUrl,
      label: 'Reset My Password',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 2. Welcome Email on Registration
export const sendWelcomeEmail = async ({ to, userName, role = 'customer' }) => {
  const subject = 'Welcome to Barabar Shop!';
  const text = `Hello ${userName || 'there'},\n\nWelcome to Barabar Shop! Your ${role} account is now active.\nYou can book appointments, track grooming invoices, and enjoy exclusive loyalty smile vouchers.\n\nVisit: ${config.frontendUrl}/login`;
  const html = wrapHtmlEmail({
    title: 'Welcome to Barabar Shop! ✂️',
    preheader: 'Your premium grooming and salon portal is ready.',
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'there'}</strong>,</p>
      <p>Welcome aboard! Your <span class="highlight">${role.toUpperCase()}</span> account has been successfully created.</p>
      <div class="card">
        <div style="font-weight: 600; color: #fbbf24; margin-bottom: 8px;">What you can do:</div>
        <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px;">
          <li>Explore top-rated barbers and verified salons</li>
          <li>Book instant appointments without queueing</li>
          <li>Earn loyalty discount vouchers on regular visits</li>
          <li>Receive real-time SMS, WhatsApp and Email reminders</li>
        </ul>
      </div>
    `,
    actionButton: {
      url: `${config.frontendUrl}/login`,
      label: 'Go to My Dashboard',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 3. Booking Confirmation Email
export const sendBookingConfirmationEmail = async ({ to, userName, shopName, appointment }) => {
  const dateStr = formatEmailDate(appointment?.appointmentDate);
  const timeStr = appointment?.appointmentTime || 'N/A';
  const priceStr = `Rs. ${Number(appointment?.price || 0).toLocaleString('en-IN')}`;
  const durationStr = `${appointment?.duration || 30} mins`;

  const subject = `Booking Confirmed at ${shopName || 'Barabar Shop'}`;
  const text = `Hello ${userName || 'there'},\n\nYour appointment at ${shopName || 'Barber Shop'} is confirmed!\n\nDate: ${dateStr}\nTime: ${timeStr}\nDuration: ${durationStr}\nTotal Amount: ${priceStr}\n\nPlease arrive 5 minutes early.`;

  const html = wrapHtmlEmail({
    title: 'Booking Confirmed! 🎉',
    preheader: `Your grooming slot at ${shopName} on ${dateStr} at ${timeStr} is locked in.`,
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'Customer'}</strong>,</p>
      <p>Great news! Your grooming appointment has been confirmed at <strong class="highlight">${shopName || 'Barber Shop'}</strong>.</p>
      
      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Shop / Salon:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right; font-size: 13px;">${shopName || 'Barber Shop'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Date:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right; font-size: 13px;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Time Slot:</td>
            <td style="padding: 6px 0; color: #fbbf24; font-weight: 700; text-align: right; font-size: 13px;">${timeStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Est. Duration:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right; font-size: 13px;">${durationStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Total Payable:</td>
            <td style="padding: 6px 0; color: #34d399; font-weight: 700; text-align: right; font-size: 14px;">${priceStr}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #94a3b8;">💡 <em>Tip: You will receive an SMS/WhatsApp reminder 30 minutes before your slot.</em></p>
    `,
    actionButton: {
      url: `${config.frontendUrl}/my-appointments`,
      label: 'View Booking Details',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 4. Booking Reminder Email
export const sendBookingReminderEmail = async ({ to, userName, shopName, appointment, reminderMinutes = 30 }) => {
  const dateStr = formatEmailDate(appointment?.appointmentDate);
  const timeStr = appointment?.appointmentTime || 'N/A';

  const subject = `⏰ Reminder: Your appointment at ${shopName || 'Barber Shop'} is coming up!`;
  const text = `Hello ${userName || 'there'},\n\nReminder: Your booking at ${shopName || 'Barber Shop'} starts in about ${reminderMinutes} minutes.\n\nDate: ${dateStr}\nTime: ${timeStr}\n\nPlease reach on time.`;

  const html = wrapHtmlEmail({
    title: 'Appointment Reminder ⏰',
    preheader: `Your grooming slot starts soon at ${timeStr}.`,
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'Customer'}</strong>,</p>
      <p>This is a quick friendly reminder that your appointment at <strong class="highlight">${shopName || 'Barber Shop'}</strong> is scheduled in about <strong class="highlight">${reminderMinutes} minutes</strong>.</p>
      
      <div class="card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #94a3b8;">Time Slot:</span>
          <span style="color: #fbbf24; font-weight: 700; font-size: 15px;">${timeStr} (${dateStr})</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Shop:</span>
          <span style="color: #ffffff; font-weight: 600;">${shopName}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #cbd5e1;">Please arrive a few minutes prior to ensure a smooth, zero-delay grooming experience.</p>
    `,
    actionButton: {
      url: `${config.frontendUrl}/my-appointments`,
      label: 'Open Appointment',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 5. Booking Completed & Invoice Email
export const sendBookingCompletedEmail = async ({ to, userName, shopName, appointment }) => {
  const priceStr = `Rs. ${Number(appointment?.price || 0).toLocaleString('en-IN')}`;
  const subject = `Thank You for visiting ${shopName || 'Barabar Shop'}!`;
  const text = `Hello ${userName || 'there'},\n\nYour visit at ${shopName || 'Barber Shop'} has been marked completed.\nTotal Amount: ${priceStr}\n\nWe hope you enjoyed the service! Leave a review on your dashboard.`;

  const html = wrapHtmlEmail({
    title: 'Visit Completed! 💈',
    preheader: `Thank you for visiting ${shopName}. Your invoice has been generated.`,
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'there'}</strong>,</p>
      <p>Thank you for getting groomed at <strong class="highlight">${shopName || 'Barber Shop'}</strong>! Your appointment is officially completed.</p>
      
      <div class="card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #94a3b8;">Total Paid:</span>
          <span style="color: #34d399; font-weight: 700; font-size: 16px;">${priceStr}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Payment Method:</span>
          <span style="color: #ffffff; text-transform: capitalize;">${appointment?.paymentMethod || 'Cash'}</span>
        </div>
      </div>

      <p>How was your experience? Feel free to leave a star rating to help other customers.</p>
    `,
    actionButton: {
      url: `${config.frontendUrl}/my-invoices`,
      label: 'Download Invoice',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 6. Booking Cancelled Email
export const sendBookingCancelledEmail = async ({ to, userName, shopName, appointment }) => {
  const subject = `Booking Cancelled - ${shopName || 'Barabar Shop'}`;
  const text = `Hello ${userName || 'there'},\n\nYour appointment at ${shopName || 'Barber Shop'} on ${formatEmailDate(appointment?.appointmentDate)} at ${appointment?.appointmentTime} has been cancelled.`;

  const html = wrapHtmlEmail({
    title: 'Booking Cancelled',
    preheader: `Your appointment at ${shopName} has been cancelled.`,
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'there'}</strong>,</p>
      <p>Your appointment at <strong class="highlight">${shopName || 'Barber Shop'}</strong> scheduled for <strong>${formatEmailDate(appointment?.appointmentDate)} at ${appointment?.appointmentTime}</strong> has been cancelled.</p>
      <p>If this was unexpected or you wish to reschedule, you can book a new slot anytime.</p>
    `,
    actionButton: {
      url: `${config.frontendUrl}/barbers`,
      label: 'Book Another Appointment',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 7. Smile Coupon / Voucher Email
export const sendCouponEmail = async ({ to, userName, shopName, coupon }) => {
  const discountStr =
    coupon.discountType === 'flat' ? `Rs. ${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`;
  const subject = `🎁 You received a Smile Voucher from ${shopName || 'your barber'}!`;
  const text = `Hello ${userName || 'there'},\n\n${shopName || 'Your barber'} sent you a loyalty voucher!\n\nVoucher: ${coupon.title}\nCoupon Code: ${coupon.code}\nDiscount: ${discountStr}\nValid until: ${formatEmailDate(coupon.validUntil)}\n\nUse it during your next booking at ${config.frontendUrl}/dashboard`;

  const html = wrapHtmlEmail({
    title: 'Smile Voucher Unlocked! 🎁',
    preheader: `Use code ${coupon.code} for ${discountStr} on your next visit.`,
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'Loyal Customer'}</strong>,</p>
      <p><strong class="highlight">${shopName || 'Your Barber'}</strong> appreciates your loyalty and has rewarded you with an exclusive discount voucher!</p>
      
      <div class="card" style="text-align: center; border: 2px dashed #fbbf24; background: rgba(251, 191, 36, 0.05);">
        <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Coupon Code</div>
        <div style="font-size: 28px; font-weight: 800; color: #fbbf24; font-family: monospace; letter-spacing: 3px; margin: 8px 0;">${coupon.code}</div>
        <div style="color: #34d399; font-weight: 700; font-size: 16px;">${discountStr}</div>
        <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Valid until: ${formatEmailDate(coupon.validUntil)}</div>
      </div>
    `,
    actionButton: {
      url: `${config.frontendUrl}/barbers`,
      label: 'Book & Apply Voucher',
    },
  });

  return sendEmail({ to, subject, text, html });
};

// 8. Barber Studio Email Verification
export const sendBarberVerificationEmail = async ({ to, userName, shopName, otpCode }) => {
  const subject = `Verify your Barber Studio Email - ${otpCode} is your OTP`;
  const text = `Hello ${userName || 'Barber Partner'},\n\nThank you for registering your studio "${shopName || 'Barber Studio'}" on Barabar Shop.\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in 15 minutes.\nPlease enter this code on the verification page to activate your studio account.\n\nIf you did not initiate this request, please disregard this email.`;

  const html = wrapHtmlEmail({
    title: 'Verify Barber Account ✂️',
    preheader: `Your 6-digit verification code is ${otpCode}. Valid for 15 minutes.`,
    contentHtml: `
      <p>Hello <strong style="color: #ffffff;">${userName || 'Barber Partner'}</strong>,</p>
      <p>Thank you for registering your salon / studio <strong class="highlight">"${shopName || 'Barber Studio'}"</strong> on Barabar Shop. To verify your email address and activate your partner portal, use the one-time verification code below:</p>

      <div class="card" style="text-align: center; border: 2px dashed #fbbf24; background: rgba(251, 191, 36, 0.05); padding: 24px;">
        <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">6-Digit Verification Code</div>
        <div style="font-size: 36px; font-weight: 800; color: #fbbf24; font-family: 'Courier New', monospace; letter-spacing: 8px; margin: 10px 0;">${otpCode}</div>
        <div style="color: #cbd5e1; font-size: 13px; margin-top: 8px;">⏳ Expires in <strong style="color: #ffffff;">15 minutes</strong></div>
      </div>

      <p style="font-size: 13px; color: #94a3b8;">⚠️ <em>For your account security, never share this code with anyone. Barabar Shop representatives will never ask for your verification code.</em></p>
    `,
    actionButton: {
      url: `${config.frontendUrl}/verify-email?email=${encodeURIComponent(to)}`,
      label: 'Verify Email Address',
    },
  });

  return sendEmail({ to, subject, text, html });
};

