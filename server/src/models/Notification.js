import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_completed',
        'booking_cancelled',
        'reminder',
        'voucher',
        'account',
        'system',
        'barber_approval',
        'alert',
      ],
      default: 'system',
    },
    link: {
      type: String,
      default: '',
    },
    tab: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveryChannels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Index for fast query of user's latest unread and sorted notifications
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
