import { config } from '../config/config.js';

const buildEmailContent = ({ resetUrl, userName }) => ({
  subject: 'Reset your Barber Shop password',
  text: `Hello ${userName || 'there'},\n\nUse this link to reset your password: ${resetUrl}\n\nThis link is valid for 15 minutes.\n\nIf you did not request this change, please ignore this email.`,
});

const sendEmail = async ({ to, subject, text }) => {
  if (!to) {
    return { delivered: false };
  }

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    await sendWithMailtoFallback({ to, subject, text });
    return { delivered: false };
  }

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

  await transporter.sendMail({
    from: config.mailFrom,
    to,
    subject,
    text,
  });

  return { delivered: true };
};

const sendWithMailtoFallback = async ({ to, subject, text }) => {
  console.log('Email transport not configured. Email content for manual delivery:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
};

const formatEmailDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

export const sendPasswordResetEmail = async ({ to, resetUrl, userName }) => {
  const { subject, text } = buildEmailContent({ resetUrl, userName });

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    return sendEmail({ to, subject, text });
  }

  return sendEmail({ to, subject, text });
};

export const sendBookingCompletedEmail = async ({ to, userName, shopName, appointment }) =>
  sendEmail({
    to,
    subject: 'Your barber booking is completed',
    text: `Hello ${userName || 'there'},\n\nYour booking at ${shopName || 'Barber Shop'} has been marked completed.\n\nDate: ${formatEmailDate(appointment?.appointmentDate)}\nTime: ${appointment?.appointmentTime || 'N/A'}\n\nThank you for visiting.`,
  });

export const sendBookingConfirmationEmail = async ({ to, userName, shopName, appointment }) =>
  sendEmail({
    to,
    subject: 'Your barber booking is confirmed',
    text: `Hello ${userName || 'there'},\n\nYour booking at ${shopName || 'Barber Shop'} is confirmed.\n\nDate: ${formatEmailDate(appointment?.appointmentDate)}\nTime: ${appointment?.appointmentTime || 'N/A'}\n\nPlease arrive on time.`,
  });

export const sendBookingReminderEmail = async ({ to, userName, shopName, appointment }) =>
  sendEmail({
    to,
    subject: 'Reminder: your booking starts soon',
    text: `Hello ${userName || 'there'},\n\nReminder: your booking at ${shopName || 'Barber Shop'} starts in about 30 minutes.\n\nDate: ${appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}\nTime: ${appointment?.appointmentTime || 'N/A'}\nService duration: ${appointment?.duration || 0} minutes\n\nPlease reach on time.`,
  });

export const sendCouponEmail = async ({ to, userName, shopName, coupon }) =>
  sendEmail({
    to,
    subject: `New voucher from ${shopName || 'your barber'}`,
    text: `Hello ${userName || 'there'},\n\n${shopName || 'Your barber'} sent you a voucher.\n\n${coupon.title}\nCode: ${coupon.code}\nDiscount: ${coupon.discountType === 'flat' ? `Rs. ${coupon.discountValue}` : `${coupon.discountValue}%`}\nValid until: ${coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'N/A'}\n\nUse it on your next booking.`,
  });
