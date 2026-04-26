import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxLength: [30, 'Coupon code cannot exceed 30 characters'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, 'Coupon title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [300, 'Coupon description cannot exceed 300 characters'],
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      default: 'percent',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    minSpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    audience: {
      type: String,
      enum: ['all', 'regular'],
      default: 'regular',
    },
    assignedCustomerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ barberId: 1, code: 1 }, { unique: true });

export const Coupon = mongoose.model('Coupon', couponSchema);
