import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    category: {
      type: String,
      enum: ['service', 'behavior', 'hygiene', 'pricing', 'delay', 'other'],
      default: 'other',
    },
    message: {
      type: String,
      required: [true, 'Please describe the issue'],
      trim: true,
      maxLength: [800, 'Report cannot exceed 800 characters'],
    },
    status: {
      type: String,
      enum: ['open', 'verified', 'rejected', 'resolved'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    adminNote: {
      type: String,
      trim: true,
      maxLength: [500, 'Admin note cannot exceed 500 characters'],
      default: '',
    },
    actionType: {
      type: String,
      enum: ['none', 'warning', 'suspended'],
      default: 'none',
    },
    suspendedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
