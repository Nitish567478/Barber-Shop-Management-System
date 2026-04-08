import mongoose from 'mongoose';

// Define the day availability schema
const dayAvailabilitySchema = new mongoose.Schema(
  {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    isWorking: { type: Boolean, default: true },
  },
  { _id: false }
);

const barberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      trim: true,
      maxLength: [100, 'Shop name cannot exceed 100 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxLength: [150, 'Location cannot exceed 150 characters'],
      default: '',
    },
    shopImage: {
      type: String,
      trim: true,
      default: '',
    },
    openingTime: {
      type: String,
      default: '09:00',
    },
    closingTime: {
      type: String,
      default: '18:00',
    },
    specialization: {
      type: [String],
      default: ['haircut', 'shaving'],
    },
    experience: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    availability: {
      type: {
        monday: dayAvailabilitySchema,
        tuesday: dayAvailabilitySchema,
        wednesday: dayAvailabilitySchema,
        thursday: dayAvailabilitySchema,
        friday: dayAvailabilitySchema,
        saturday: dayAvailabilitySchema,
        sunday: dayAvailabilitySchema,
      },
      default: {
        monday: { start: '09:00', end: '18:00', isWorking: true },
        tuesday: { start: '09:00', end: '18:00', isWorking: true },
        wednesday: { start: '09:00', end: '18:00', isWorking: true },
        thursday: { start: '09:00', end: '18:00', isWorking: true },
        friday: { start: '09:00', end: '18:00', isWorking: true },
        saturday: { start: '10:00', end: '16:00', isWorking: true },
        sunday: { start: '00:00', end: '00:00', isWorking: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Barber = mongoose.model('Barber', barberSchema);
