import {
  sendBookingReminderEmail,
  sendBookingCompletedEmail,
  sendBookingConfirmationEmail,
} from './email.js';
import { sendSMS } from './sms.js';

export const sendNotification = async ({
  type,
  user,
  shopName,
  appointment,
}) => {
  try {
    let message = '';

    if (type === 'confirmation') {
      message = `Hi ${user.name}, your booking at ${shopName} is confirmed.\nTime: ${appointment.appointmentTime}`;
    }

    if (type === 'reminder') {
      message = `Reminder: Your appointment at ${shopName} starts in 30 minutes.`;
    }

    if (type === 'completed') {
      message = `Thanks ${user.name}! Your visit at ${shopName} is completed.`;
    }

    if (type === 'completed') {
      await sendBookingCompletedEmail({
        to: user.email,
        userName: user.name,
        shopName,
        appointment,
      });
    } else if (type === 'confirmation') {
      await sendBookingConfirmationEmail({
        to: user.email,
        userName: user.name,
        shopName,
        appointment,
      });
    } else {
      await sendBookingReminderEmail({
        to: user.email,
        userName: user.name,
        shopName,
        appointment,
      });
    }

    if (user.phone) {
      await sendSMS({
        to: user.phone,
        message,
      });
    }
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};
