import { Appointment } from '../models/Appointment.js';
import { sendBookingReminderEmail } from './email.js';
import { sendNotification } from './notifications.js';

const getAppointmentStart = (appointment) => {
  const date = new Date(appointment.appointmentDate);

  const [hours, minutes] = appointment.appointmentTime
    .split(':')
    .map(Number);

  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const processBookingReminders = async () => {
  try {
    const now = new Date();

    const windowStart = new Date(now.getTime() + 25 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 35 * 60 * 1000);

    const appointments = await Appointment.find({
      status: 'scheduled',
      reminderSentAt: null,
    })
      .populate('customerId', 'name email')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name' },
      });

    for (const appointment of appointments) {
      const startsAt = getAppointmentStart(appointment);

      if (startsAt >= windowStart && startsAt <= windowEnd) {
        await sendNotification({
          type: 'reminder',
          user: {
            name: appointment.customerId?.name,
            email: appointment.customerId?.email,
            phone: appointment.customerId?.phone,
          },
          shopName: appointment.barberId?.shopName || 'Barber Shop',
          appointment,
        });

        appointment.reminderSentAt = new Date();
        await appointment.save();

        console.log(`Reminder sent to ${appointment.customerId?.email}`);
      }
    }
  } catch (error) {
    console.error('Reminder error:', error.message);
  }
};

export const startBookingReminderWorker = () => {
  console.log('Reminder worker started...');

  setInterval(() => {
    processBookingReminders();
  }, 5 * 60 * 1000); // every 5 min
};