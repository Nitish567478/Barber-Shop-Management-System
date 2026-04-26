import { Appointment } from '../models/Appointment.js';
import { Barber } from '../models/Barber.js';
import { Coupon } from '../models/Coupon.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendCouponEmail } from '../utils/email.js';

const couponPopulate = [
  {
    path: 'barberId',
    populate: { path: 'userId', select: 'name email phone' },
  },
  { path: 'assignedCustomerIds', select: 'name email phone' },
];

const getMyBarber = async (userId) => {
  const barber = await Barber.findOne({ userId });
  if (!barber) {
    throw new AppError('Barber profile not found', 404);
  }
  return barber;
};

export const getMyCoupons = async (req, res, next) => {
  try {
    const barber = await getMyBarber(req.user.userId);
    const coupons = await Coupon.find({ barberId: barber._id })
      .populate(couponPopulate)
      .sort({ createdAt: -1 });

    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const barber = await getMyBarber(req.user.userId);
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minSpend,
      validDays = 7,
      audience = 'regular',
      assignedCustomerIds = [],
    } = req.body;

    const days = Math.max(1, Number(validDays) || 7);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + days);

    const coupon = await Coupon.create({
      barberId: barber._id,
      code: String(code || '').trim().toUpperCase(),
      title,
      description,
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend) || 0,
      validUntil,
      audience,
      assignedCustomerIds: Array.isArray(assignedCustomerIds) ? assignedCustomerIds : [],
    });

    await coupon.populate(couponPopulate);

    await Promise.allSettled(
      coupon.assignedCustomerIds.map((customer) =>
        sendCouponEmail({
          to: customer.email,
          userName: customer.name,
          shopName: barber.shopName,
          coupon,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Coupon launched successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCoupon = async (req, res, next) => {
  try {
    const barber = await getMyBarber(req.user.userId);
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, barberId: barber._id },
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    ).populate(couponPopulate);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    res.json({ success: true, message: 'Coupon updated successfully', coupon });
  } catch (error) {
    next(error);
  }
};

export const getMyCustomerVouchers = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ customerId: req.user.userId }).select('barberId status');
    const completedByBarber = new Map();

    appointments.forEach((appointment) => {
      if (appointment.status === 'completed' && appointment.barberId) {
        const key = String(appointment.barberId);
        completedByBarber.set(key, (completedByBarber.get(key) || 0) + 1);
      }
    });

    const barberIds = [...new Set(appointments.map((appointment) => appointment.barberId).filter(Boolean).map(String))];
    const coupons = await Coupon.find({
      isActive: true,
      validUntil: { $gte: new Date() },
      barberId: { $in: barberIds },
      $or: [
        { audience: 'all' },
        { assignedCustomerIds: req.user.userId },
        { audience: 'regular' },
      ],
    })
      .populate(couponPopulate)
      .sort({ validUntil: 1 });

    const vouchers = coupons.filter((coupon) => {
      if (coupon.assignedCustomerIds.some((customer) => String(customer._id) === String(req.user.userId))) {
        return true;
      }
      if (coupon.audience === 'all') {
        return true;
      }
      return (completedByBarber.get(String(coupon.barberId?._id || coupon.barberId)) || 0) >= 2;
    });

    res.json({ success: true, count: vouchers.length, coupons: vouchers });
  } catch (error) {
    next(error);
  }
};

export const getRegularCustomers = async (req, res, next) => {
  try {
    const barber = await getMyBarber(req.user.userId);
    const appointments = await Appointment.find({ barberId: barber._id })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    const customers = new Map();
    appointments.forEach((appointment) => {
      if (!appointment.customerId?._id) return;
      const key = String(appointment.customerId._id);
      const current = customers.get(key) || {
        ...appointment.customerId.toObject(),
        bookingCount: 0,
        completedCount: 0,
      };
      current.bookingCount += 1;
      if (appointment.status === 'completed') current.completedCount += 1;
      customers.set(key, current);
    });

    res.json({
      success: true,
      customers: Array.from(customers.values()).sort((a, b) => b.completedCount - a.completedCount),
    });
  } catch (error) {
    next(error);
  }
};
