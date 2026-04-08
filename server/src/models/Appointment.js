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
      required: true,
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
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
