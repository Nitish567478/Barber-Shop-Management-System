import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please enter amount'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxLength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
