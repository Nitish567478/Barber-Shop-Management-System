import { Appointment } from '../models/Appointment.js';
import { sendBookingReminderEmail } from './email.js';

const getAppointmentStart = (appointment) => {
  const date = new Date(appointment.appointmentDate);
  const [hours, minutes] = String(appointment.appointmentTime || '00:00')
    .split(':')
    .map((item) => Number(item));

  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

export const processBookingReminders = async () => {
  const now = new Date();
  const inTwentyFive = new Date(now.getTime() + 25 * 60 * 1000);
  const inThirtyFive = new Date(now.getTime() + 35 * 60 * 1000);

  const appointments = await Appointment.find({
    status: 'scheduled',
    reminderSentAt: null,
    appointmentDate: {
      $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    },
  })
    .populate('customerId', 'name email phone')
    .populate({
      path: 'barberId',
      populate: { path: 'userId', select: 'name email phone' },
    });

  const due = appointments.filter((appointment) => {
    const startsAt = getAppointmentStart(appointment);
    return startsAt >= inTwentyFive && startsAt <= inThirtyFive;
  });

  await Promise.allSettled(
    due.map(async (appointment) => {
      await sendBookingReminderEmail({
        to: appointment.customerId?.email,
        userName: appointment.customerId?.name,
        shopName: appointment.barberId?.shopName,
        appointment,
      });

      appointment.reminderSentAt = new Date();
      await appointment.save();
    })
  );
};

export const startBookingReminderWorker = () => {
  setInterval(() => {
    processBookingReminders().catch((error) => {
      console.error('Booking reminder worker failed:', error.message);
    });
  }, 5 * 60 * 1000);
};
