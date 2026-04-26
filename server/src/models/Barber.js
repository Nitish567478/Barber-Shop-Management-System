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
    staffMembers: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    slotCapacity: {
      type: Number,
      default: 3,
      min: 1,
      max: 20,
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
    listingStatus: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    listingRequestedAt: {
      type: Date,
      default: null,
    },
    listingApprovedAt: {
      type: Date,
      default: null,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      trim: true,
      maxLength: [300, 'Suspension reason cannot exceed 300 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

export const Barber = mongoose.model('Barber', barberSchema);
