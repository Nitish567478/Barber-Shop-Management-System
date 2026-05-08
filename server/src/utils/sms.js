import { config } from '../config/config.js';

const createTwilioClient = async () => {
  if (!config.twilioSID || !config.twilioAuthToken || !config.twilioPhone) {
    console.warn('Twilio credentials are not configured. SMS messages will not be sent.');
    return null;
  }

  try {
    const twilio = await import('twilio');
    return twilio.default(config.twilioSID, config.twilioAuthToken);
  } catch (error) {
    console.warn('Twilio package is not installed or cannot be loaded. SMS messages will not be sent.');
    return null;
  }
};

const normalizePhoneNumber = (value) => {
  const phone = String(value || '').trim();
  if (!phone) return '';
  if (phone.startsWith('+')) return phone;

  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${config.defaultSmsCountryCode}${digits}`;
  }
  if (digits.length > 10 && !digits.startsWith('0')) {
    return `+${digits}`;
  }

  return phone;
};

export const sendSMS = async ({ to, message }) => {
  try {
    const normalizedTo = normalizePhoneNumber(to);
    if (!normalizedTo || !message) return;

    const client = await createTwilioClient();
    if (!client) {
      return;
    }

    await client.messages.create({
      body: message,
      from: config.twilioPhone,
      to: normalizedTo,
    });

    console.log('SMS sent to:', normalizedTo);
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};
