import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { Coupon } from '../models/Coupon.js';
import { Invoice } from '../models/Invoice.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateInvoiceNumber } from '../utils/helpers.js';
import { sendNotification } from '../utils/notifications.js';

const appointmentPopulate = [
  { path: 'customerId', select: 'name email phone' },
  {
    path: 'barberId',
    populate: {
      path: 'userId',
      select: 'name email phone',
    },
  },
  { path: 'serviceId', select: 'name price duration category barberId' },
  { path: 'serviceIds', select: 'name price duration category barberId' },
  { path: 'couponId', select: 'code title discountType discountValue minSpend' },
];

const getServiceList = (appointment) => {
  if (Array.isArray(appointment.serviceIds) && appointment.serviceIds.length > 0) {
    return appointment.serviceIds;
  }

  return appointment.serviceId ? [appointment.serviceId] : [];
};

// Get all appointments
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find().populate(appointmentPopulate);

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's appointments
export const getUserAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ customerId: req.user.userId })
      .populate(appointmentPopulate)
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// Create appointment
export const createAppointment = async (req, res, next) => {
  try {
    const {
      barberId,
      serviceIds = [],
      appointmentDate,
      appointmentTime,
      notes,
      paymentMethod = 'cash',
      selectedStaffName = '',
      couponCode = '',
    } = req.body;

    if (paymentMethod === 'online') {
      throw new AppError('Online payment is coming soon. Please choose cash to continue.', 400);
    }

    const services = await Service.find({
      _id: { $in: serviceIds },
      isActive: true,
    });

    if (services.length !== serviceIds.length) {
      throw new AppError('One or more selected services are not available', 404);
    }

    const serviceBarberIds = [
      ...new Set(
        services
          .map((service) => (service.barberId ? String(service.barberId) : null))
          .filter(Boolean)
      ),
    ];

    let assignedBarberId = barberId || serviceBarberIds[0] || null;

    if (barberId) {
      const barber = await Barber.findById(barberId);
      if (
        !barber ||
        !barber.isActive ||
        !barber.isApproved ||
        (barber.suspendedUntil && barber.suspendedUntil > new Date()) ||
        barber.listingStatus && barber.listingStatus !== 'approved'
      ) {
        throw new AppError('Selected barber is not available', 404);
      }
      if (
        serviceBarberIds.length > 0 &&
        serviceBarberIds.some((serviceBarberId) => serviceBarberId !== String(barberId))
      ) {
        throw new AppError(
          'Selected services belong to a different barber. Please choose services from the same barber.',
          400
        );
      }
    }

    if (serviceBarberIds.length > 1) {
      throw new AppError('Please choose services from one barber at a time.', 400);
    }

    let barberProfile = null;
    if (assignedBarberId) {
      barberProfile = await Barber.findById(assignedBarberId);
      if (
        !barberProfile ||
        !barberProfile.isActive ||
        !barberProfile.isApproved ||
        (barberProfile.suspendedUntil && barberProfile.suspendedUntil > new Date()) ||
        (barberProfile.listingStatus && barberProfile.listingStatus !== 'approved')
      ) {
        throw new AppError('Selected barber is not available', 404);
      }

      if (
        selectedStaffName &&
        barberProfile.staffMembers.length > 0 &&
        !barberProfile.staffMembers.includes(selectedStaffName)
      ) {
        throw new AppError('Selected staff member is not available in this shop', 400);
      }

      const slotStart = new Date(appointmentDate);
      const slotEnd = new Date(appointmentDate);
      slotStart.setHours(0, 0, 0, 0);
      slotEnd.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.countDocuments({
        barberId: assignedBarberId,
        appointmentDate: {
          $gte: slotStart,
          $lte: slotEnd,
        },
        appointmentTime,
        status: 'scheduled',
      });

      if (existingAppointments >= (barberProfile.slotCapacity || 3)) {
        throw new AppError(
          'This time slot is sold out. Please choose another time.',
          409
        );
      }
    }

    const totalDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0);
    const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);
    let finalPrice = totalPrice;
    let discountAmount = 0;
    let coupon = null;

    const normalizedCouponCode = String(couponCode || '').trim().toUpperCase();
    if (normalizedCouponCode) {
      if (!assignedBarberId) {
        throw new AppError('Please choose the coupon barber before applying this coupon.', 400);
      }

      coupon = await Coupon.findOne({
        barberId: assignedBarberId,
        code: normalizedCouponCode,
        isActive: true,
        validUntil: { $gte: new Date() },
        $or: [{ validFrom: { $lte: new Date() } }, { validFrom: { $exists: false } }],
      });

      if (!coupon) {
        throw new AppError('Coupon is invalid or expired.', 400);
      }

      if (totalPrice < Number(coupon.minSpend || 0)) {
        throw new AppError(`Coupon needs a minimum spend of Rs. ${Number(coupon.minSpend || 0).toLocaleString('en-IN')}.`, 400);
      }

      const isAssigned = coupon.assignedCustomerIds.some(
        (customerId) => String(customerId) === String(req.user.userId)
      );

      if (!isAssigned && coupon.audience === 'regular') {
        const completedCount = await Appointment.countDocuments({
          customerId: req.user.userId,
          barberId: assignedBarberId,
          status: 'completed',
        });

        if (completedCount < 2) {
          throw new AppError('This coupon is only for regular customers of this barber.', 403);
        }
      }

      discountAmount =
        coupon.discountType === 'flat'
          ? Number(coupon.discountValue || 0)
          : (totalPrice * Number(coupon.discountValue || 0)) / 100;
      discountAmount = Math.min(totalPrice, Math.max(0, Math.round(discountAmount)));
      finalPrice = Math.max(0, totalPrice - discountAmount);
    }

    const appointment = new Appointment({
      customerId: req.user.userId,
      barberId: assignedBarberId,
      serviceId: services[0]?._id || null,
      serviceIds: services.map((service) => service._id),
      appointmentDate,
      appointmentTime,
      duration: totalDuration,
      price: finalPrice,
      originalPrice: totalPrice,
      discountAmount,
      couponCode: normalizedCouponCode,
      couponId: coupon?._id || null,
      notes,
      paymentMethod,
      selectedStaffName,
    });

    await appointment.save();
    await appointment.populate(appointmentPopulate);

    await sendNotification({
      type: 'confirmation',
      user: req.user,
      shopName: barberProfile?.shopName || 'Barber Shop',
      appointment,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment (Admin only)
export const updateAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, status, notes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { appointmentDate, appointmentTime, status, notes },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (req.user.role === 'customer' && String(appointment.customerId) !== String(req.user.userId)) {
      throw new AppError('You can only cancel your own appointments', 403);
    }

    if (req.user.role === 'barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (!barber || String(appointment.barberId) !== String(barber._id)) {
        throw new AppError('You can only cancel your own bookings', 403);
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulate);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getBarberAppointments = async (req, res, next) => {
  try {
    const barber = await Barber.findOne({ userId: req.user.userId });
    if (!barber) {
      throw new AppError('Barber profile not found', 404);
    }

    const appointments = await Appointment.find({ barberId: barber._id })
      .populate(appointmentPopulate)
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBarberAppointment = async (req, res, next) => {
  try {
    const { status, appointmentDate, appointmentTime, notes } = req.body;
    const barber = await Barber.findOne({ userId: req.user.userId });

    if (!barber) {
      throw new AppError('Barber profile not found', 404);
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (String(appointment.barberId) !== String(barber._id)) {
      throw new AppError('You can only manage your own bookings', 403);
    }

    if (status) {
      if (!['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
        throw new AppError('Invalid booking status', 400);
      }
      appointment.status = status;
    }
    if (appointmentDate) {
      appointment.appointmentDate = appointmentDate;
    }
    if (appointmentTime) {
      appointment.appointmentTime = appointmentTime;
    }
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    if (status === 'completed') {
      const existingInvoice = await Invoice.findOne({ appointmentId: appointment._id });
      if (existingInvoice) {
        existingInvoice.amount = appointment.price;
        existingInvoice.paymentMethod = appointment.paymentMethod || existingInvoice.paymentMethod || 'cash';
        existingInvoice.paymentStatus = 'completed';
        await existingInvoice.save();
      } else if (appointment.barberId) {
        await Invoice.create({
          appointmentId: appointment._id,
          customerId: appointment.customerId,
          barberId: appointment.barberId,
          invoiceNumber: generateInvoiceNumber(),
          amount: appointment.price,
          paymentMethod: appointment.paymentMethod || 'cash',
          paymentStatus: 'completed',
          notes: appointment.couponCode
            ? `Coupon ${appointment.couponCode} applied. Discount Rs. ${appointment.discountAmount || 0}.`
            : '',
        });
      }
    }

    await appointment.populate(appointmentPopulate);

    if (status === 'completed') {
      await sendNotification({
        type: 'completed',
        user: appointment.customerId || {},
        shopName: appointment.barberId?.shopName || 'Barber Shop',
        appointment,
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAppointmentFeedback = async (req, res, next) => {
  try {
    const { rating, comment, improvement } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (String(appointment.customerId) !== String(req.user.userId)) {
      throw new AppError('You can only review your own completed appointment', 403);
    }

    if (appointment.status !== 'completed') {
      throw new AppError('Feedback can only be given after the booking is completed', 400);
    }

    appointment.feedback = {
      rating: Number(rating),
      comment: comment || '',
      improvement: improvement || '',
      submittedAt: new Date(),
    };

    await appointment.save();
    await appointment.populate(appointmentPopulate);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
