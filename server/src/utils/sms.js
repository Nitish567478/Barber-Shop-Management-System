import { config } from '../config/config.js';

export const normalizePhoneNumber = (value) => {
  const phone = String(value || '').trim();
  if (!phone) return '';
  if (phone.startsWith('+')) return phone;

  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${config.defaultSmsCountryCode || '+91'}${digits}`;
  }
  if (digits.length > 10 && !digits.startsWith('0')) {
    return `+${digits}`;
  }

  return phone;
};

// Generates direct Click-to-WhatsApp deep link
export const generateWhatsAppLink = ({ phone, message }) => {
  const normalized = normalizePhoneNumber(phone).replace(/\+/g, '');
  if (!normalized) return '';
  const encodedMessage = encodeURIComponent(message || '');
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
};

const createTwilioClient = async () => {
  if (!config.twilioSID || !config.twilioAuthToken) {
    return null;
  }

  try {
    const twilio = await import('twilio');
    return twilio.default(config.twilioSID, config.twilioAuthToken);
  } catch (error) {
    console.warn('⚠️ Twilio package is not installed or cannot be loaded:', error.message);
    return null;
  }
};

/**
 * Send Transactional SMS
 */
export const sendSMS = async ({ to, message }) => {
  try {
    const normalizedTo = normalizePhoneNumber(to);
    if (!normalizedTo || !message) {
      return { delivered: false, reason: 'Invalid phone or empty message' };
    }

    const client = await createTwilioClient();
    if (client && config.twilioPhone) {
      const response = await client.messages.create({
        body: message,
        from: config.twilioPhone,
        to: normalizedTo,
      });

      console.log(`📱 [SMS DELIVERED] To: ${normalizedTo} | SID: ${response.sid}`);
      return { delivered: true, sid: response.sid };
    }

    // Graceful Console Simulation
    console.log('\n======================================================');
    console.log('📱 [SMS NOTIFICATION SIMULATION]');
    console.log(`To:      ${normalizedTo}`);
    console.log(`From:    ${config.twilioPhone || 'BARABAR-SMS'}`);
    console.log('------------------------------------------------------');
    console.log(message);
    console.log('======================================================\n');

    return { delivered: false, simulated: true };
  } catch (err) {
    console.error('❌ SMS error:', err.message);
    return { delivered: false, error: err.message };
  }
};

/**
 * Send WhatsApp Message
 */
export const sendWhatsApp = async ({ to, message }) => {
  try {
    const normalizedTo = normalizePhoneNumber(to);
    if (!normalizedTo || !message) {
      return { delivered: false, reason: 'Invalid phone or empty message' };
    }

    const client = await createTwilioClient();
    const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_NUMBER || (config.twilioPhone ? `whatsapp:${config.twilioPhone}` : 'whatsapp:+14155238886');

    if (client && twilioWhatsAppFrom) {
      try {
        const response = await client.messages.create({
          body: message,
          from: twilioWhatsAppFrom.startsWith('whatsapp:') ? twilioWhatsAppFrom : `whatsapp:${twilioWhatsAppFrom}`,
          to: `whatsapp:${normalizedTo}`,
        });

        console.log(`💬 [WHATSAPP DELIVERED] To: ${normalizedTo} | SID: ${response.sid}`);
        return { delivered: true, sid: response.sid };
      } catch (waErr) {
        console.warn(`⚠️ Twilio WhatsApp send error: ${waErr.message}. Falling back to simulation.`);
      }
    }

    const waLink = generateWhatsAppLink({ phone: normalizedTo, message });

    // Graceful Console Simulation
    console.log('\n======================================================');
    console.log('💬 [WHATSAPP NOTIFICATION SIMULATION]');
    console.log(`To:           ${normalizedTo}`);
    console.log(`Click-to-WA:  ${waLink}`);
    console.log('------------------------------------------------------');
    console.log(message);
    console.log('======================================================\n');

    return { delivered: false, simulated: true, waLink };
  } catch (err) {
    console.error('❌ WhatsApp error:', err.message);
    return { delivered: false, error: err.message };
  }
};
