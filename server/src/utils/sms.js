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

export const sendSMS = async ({ to, message }) => {
  try {
    if (!to || !message) return;

    const client = await createTwilioClient();
    if (!client) {
      return;
    }

    await client.messages.create({
      body: message,
      from: config.twilioPhone,
      to,
    });

    console.log('SMS sent to:', to);
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};
