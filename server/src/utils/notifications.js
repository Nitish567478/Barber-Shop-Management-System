import { Notification } from '../models/Notification.js';
import {
  sendBookingReminderEmail,
  sendBookingCompletedEmail,
  sendBookingConfirmationEmail,
  sendBookingCancelledEmail,
  sendCouponEmail,
  sendWelcomeEmail,
  sendEmail,
} from './email.js';
import { sendSMS, sendWhatsApp, generateWhatsAppLink } from './sms.js';

export const sendNotification = async ({
  type,
  user,
  shopName,
  appointment,
  coupon,
  customTitle,
  customMessage,
  link = '',
  tab = '',
  metadata = {},
}) => {
  try {
    if (!user || (!user._id && !user.id && !user.email && !user.phone)) {
      console.warn('⚠️ sendNotification called with invalid user object');
      return null;
    }

    const userId = user._id || user.id || null;
    const userName = user.name || 'Customer';
    const userEmail = user.email || '';
    const userPhone = user.phone || '';

    let title = customTitle || '';
    let message = customMessage || '';
    let smsMessage = '';
    let waMessage = '';
    let notificationType = 'system';
    let targetLink = link || '/dashboard';
    let targetTab = tab || 'overview';

    const formatApptDate = (val) =>
      val ? new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A';
    const apptTime = appointment?.appointmentTime || 'N/A';
    const apptDate = formatApptDate(appointment?.appointmentDate);
    const shop = shopName || 'Barabar Shop';

    // 1. Determine Messages & Types based on event
    if (type === 'confirmation') {
      notificationType = 'booking_confirmed';
      title = `Booking Confirmed at ${shop}`;
      message = `Your grooming session at ${shop} on ${apptDate} at ${apptTime} is confirmed.`;
      smsMessage = `Hi ${userName}, your booking at ${shop} is CONFIRMED for ${apptDate} at ${apptTime}. Duration: ${appointment?.duration || 30} mins. Total: Rs.${appointment?.price || 0}. - Barabar Shop`;
      waMessage = `✂️ *Booking Confirmed!*\n\nHi *${userName}*,\nYour grooming slot at *${shop}* is confirmed.\n\n📅 *Date:* ${apptDate}\n⏰ *Time:* ${apptTime}\n💰 *Amount:* Rs. ${appointment?.price || 0}\n\n📍 Please reach on time. See you soon!`;
      targetLink = '/my-appointments';
    } else if (type === 'reminder') {
      notificationType = 'reminder';
      title = `Reminder: Appointment at ${shop}`;
      message = `Reminder: Your grooming appointment at ${shop} starts in about 30 minutes (${apptTime}).`;
      smsMessage = `Reminder: Hi ${userName}, your appointment at ${shop} starts in 30 mins at ${apptTime}. Please reach on time! - Barabar Shop`;
      waMessage = `⏰ *Grooming Reminder!*\n\nHi *${userName}*,\nYour appointment at *${shop}* starts in 30 minutes at *${apptTime}*.\n\nSee your booking details on Barabar Shop.`;
      targetLink = '/my-appointments';
    } else if (type === 'completed') {
      notificationType = 'booking_completed';
      title = `Visit Completed at ${shop}`;
      message = `Thank you for visiting ${shop}. Your invoice of Rs. ${appointment?.price || 0} is ready.`;
      smsMessage = `Thanks ${userName}! Your visit at ${shop} is completed. Total: Rs.${appointment?.price || 0}. Check your invoice online. - Barabar Shop`;
      waMessage = `💈 *Thank You for Visiting!*\n\nHi *${userName}*,\nYour visit at *${shop}* is completed.\n\n🧾 *Total Amount:* Rs. ${appointment?.price || 0}\n\nLeave a review on Barabar Shop to let others know about your experience!`;
      targetLink = '/my-invoices';
    } else if (type === 'cancelled') {
      notificationType = 'booking_cancelled';
      title = `Booking Cancelled - ${shop}`;
      message = `Your appointment at ${shop} on ${apptDate} at ${apptTime} was cancelled.`;
      smsMessage = `Hi ${userName}, your appointment at ${shop} on ${apptDate} at ${apptTime} has been cancelled. - Barabar Shop`;
      waMessage = `❌ *Booking Cancelled*\n\nHi *${userName}*,\nYour appointment at *${shop}* scheduled for ${apptDate} at ${apptTime} has been cancelled.\n\nBook a new slot anytime on Barabar Shop.`;
      targetLink = '/barbers';
    } else if (type === 'voucher') {
      notificationType = 'voucher';
      title = `New Smile Voucher: ${coupon?.code || 'LOYALTY'}`;
      message = `You received a special discount voucher from ${shop}! Code: ${coupon?.code}`;
      smsMessage = `Special gift! ${shop} sent you a voucher: ${coupon?.code} (${coupon?.discountType === 'flat' ? `Rs.${coupon?.discountValue} OFF` : `${coupon?.discountValue}% OFF`}). Use on your next visit! - Barabar Shop`;
      waMessage = `🎁 *Smile Voucher Unlocked!*\n\nHi *${userName}*,\n${shop} rewarded you with an exclusive discount!\n\n🏷️ *Code:* *${coupon?.code}*\n💎 *Discount:* ${coupon?.discountType === 'flat' ? `Rs. ${coupon?.discountValue} OFF` : `${coupon?.discountValue}% OFF`}\n\nUse it on your next booking!`;
      targetLink = '/dashboard';
      targetTab = 'vouchers';
    } else if (type === 'welcome') {
      notificationType = 'account';
      title = `Welcome to Barabar Shop!`;
      message = `Your account is ready. Book your first appointment or explore verified barbers.`;
      smsMessage = `Welcome to Barabar Shop, ${userName}! Explore top-rated barbers and book your first grooming slot now. - Barabar Shop`;
      waMessage = `🎉 *Welcome to Barabar Shop!*\n\nHi *${userName}*,\nYour account is active. Book haircuts, shaving, and grooming from top-rated barbers with zero wait time.`;
      targetLink = '/barbers';
    } else {
      title = customTitle || 'Notification';
      message = customMessage || 'You have a new update on Barabar Shop.';
      smsMessage = `${title}: ${message} - Barabar Shop`;
      waMessage = `🔔 *${title}*\n\n${message}`;
    }

    const channelsSent = {
      inApp: false,
      email: false,
      sms: false,
      whatsapp: false,
    };

    // 2. Persist In-App Notification if User ID exists
    let savedNotification = null;
    if (userId) {
      try {
        savedNotification = await Notification.create({
          userId,
          title,
          message,
          type: notificationType,
          link: targetLink,
          tab: targetTab,
          metadata: {
            shopName: shop,
            appointmentId: appointment?._id || appointment?.id || null,
            ...metadata,
          },
          isRead: false,
          deliveryChannels: { inApp: true, email: !!userEmail, sms: !!userPhone, whatsapp: !!userPhone },
        });
        channelsSent.inApp = true;
      } catch (dbErr) {
        console.warn('⚠️ Could not save in-app notification to DB:', dbErr.message);
      }
    }

    // 3. Dispatch Email to Registered User Email
    if (userEmail) {
      try {
        if (type === 'confirmation') {
          await sendBookingConfirmationEmail({ to: userEmail, userName, shopName: shop, appointment });
        } else if (type === 'reminder') {
          await sendBookingReminderEmail({ to: userEmail, userName, shopName: shop, appointment });
        } else if (type === 'completed') {
          await sendBookingCompletedEmail({ to: userEmail, userName, shopName: shop, appointment });
        } else if (type === 'cancelled') {
          await sendBookingCancelledEmail({ to: userEmail, userName, shopName: shop, appointment });
        } else if (type === 'voucher' && coupon) {
          await sendCouponEmail({ to: userEmail, userName, shopName: shop, coupon });
        } else if (type === 'welcome') {
          await sendWelcomeEmail({ to: userEmail, userName, role: user.role });
        } else {
          await sendEmail({ to: userEmail, subject: title, text: message });
        }
        channelsSent.email = true;
      } catch (mailErr) {
        console.warn('⚠️ Email delivery error:', mailErr.message);
      }
    }

    // 4. Dispatch SMS to Registered Mobile Number
    if (userPhone && smsMessage) {
      try {
        await sendSMS({ to: userPhone, message: smsMessage });
        channelsSent.sms = true;
      } catch (smsErr) {
        console.warn('⚠️ SMS delivery error:', smsErr.message);
      }
    }

    // 5. Dispatch WhatsApp to Registered Mobile Number
    if (userPhone && waMessage) {
      try {
        await sendWhatsApp({ to: userPhone, message: waMessage });
        channelsSent.whatsapp = true;
      } catch (waErr) {
        console.warn('⚠️ WhatsApp delivery error:', waErr.message);
      }
    }

    return {
      success: true,
      notification: savedNotification,
      channelsSent,
      whatsAppLink: userPhone ? generateWhatsAppLink({ phone: userPhone, message: waMessage }) : '',
    };
  } catch (error) {
    console.error('❌ Notification dispatcher error:', error.message);
    return null;
  }
};
