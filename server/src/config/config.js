import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173'),
  appointmentTimezoneOffsetMinutes: Number(process.env.APPOINTMENT_TIMEZONE_OFFSET_MINUTES || 330),
  jwtExpiration: '7d',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@barbershop.local',
  twilioSID: process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhone: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE || '',
  defaultSmsCountryCode: process.env.DEFAULT_SMS_COUNTRY_CODE || '+91',
};

export default config;
