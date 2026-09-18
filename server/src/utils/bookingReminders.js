import { Appointment } from '../models/Appointment.js';
import { config } from '../config/config.js';
import { sendNotification } from './notifications.js';

const getAppointmentStart = (appointment) => {
  if (!appointment?.appointmentTime || !appointment?.appointmentDate) return null;

  try {
    const [hours, minutes] = appointment.appointmentTime
      .split(':')
      .map(Number);

    const date = new Date(appointment.appointmentDate);
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hours,
        minutes,
        0,
        0
      ) - (config.appointmentTimezoneOffsetMinutes || 330) * 60 * 1000
    );

    return utcDate;
  } catch {
    return null;
  }
};

export const processBookingReminders = async () => {
  try {
    const now = new Date();

    // Look for appointments starting in the next 15 to 45 minutes
    const windowStart = new Date(now.getTime() + 10 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 50 * 60 * 1000);

    const appointments = await Appointment.find({
      status: 'scheduled',
      reminderSentAt: null,
    })
      .populate('customerId', 'name email phone')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    for (const appointment of appointments) {
      const startsAt = getAppointmentStart(appointment);
      if (!startsAt) continue;

      if (startsAt >= windowStart && startsAt <= windowEnd) {
        const shop = appointment.barberId?.shopName || 'Barber Shop';
        const customer = appointment.customerId;
        const barberUser = appointment.barberId?.userId;

        // 1. Send Reminder to Customer (In-App + Email + SMS + WhatsApp)
        if (customer) {
          await sendNotification({
            type: 'reminder',
            user: customer,
            shopName: shop,
            appointment,
          });
        }

        // 2. Send In-App Reminder to Barber Partner
        if (barberUser?._id) {
          await sendNotification({
            type: 'reminder',
            user: barberUser,
            shopName: shop,
            appointment,
            customTitle: `Upcoming Client: ${customer?.name || 'Customer'}`,
            customMessage: `Client ${customer?.name || 'Customer'} is scheduled at ${appointment.appointmentTime} today.`,
            link: '/dashboard',
            tab: 'today',
          });
        }

        appointment.reminderSentAt = new Date();
        await appointment.save();

        console.log(`⏰ [REMINDER PROCESSED] Sent to Customer (${customer?.email}) & Barber for slot ${appointment.appointmentTime}`);
      }
    }
  } catch (error) {
    console.error('❌ Reminder worker error:', error.message);
  }
};

export const startBookingReminderWorker = () => {
  console.log('⏰ Automated Booking Reminder worker initialized (interval: 2 min)...');

  // Initial check on boot
  processBookingReminders();

  // Run periodic check every 2 minutes
  setInterval(() => {
    processBookingReminders();
  }, 2 * 60 * 1000);
};
