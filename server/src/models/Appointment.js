import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
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
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    serviceIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
      ],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Please select at least one service',
      },
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Please select appointment date'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Please select appointment time'],
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      maxLength: [500, 'Notes cannot exceed 500 characters'],
    },
    selectedStaffName: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash',
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        trim: true,
        maxLength: [500, 'Feedback cannot exceed 500 characters'],
        default: '',
      },
      improvement: {
        type: String,
        trim: true,
        maxLength: [500, 'Improvement suggestion cannot exceed 500 characters'],
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
