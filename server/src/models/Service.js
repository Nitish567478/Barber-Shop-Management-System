import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please enter service name'],
      trim: true,
      maxLength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: false,
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter service price'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'Please enter service duration in minutes'],
      min: [15, 'Duration should be at least 15 minutes'],
    },
    category: {
      type: String,
      enum: ['haircut', 'shaving', 'coloring', 'treatment', 'grooming', 'other'],
      default: 'haircut',
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
