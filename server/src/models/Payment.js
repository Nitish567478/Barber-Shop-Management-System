import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'online', 'cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gatewayName: {
      type: String,
      default: 'BarberPay Instant Gateway',
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
