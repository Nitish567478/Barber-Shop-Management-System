import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all appointments
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('customerId', 'name email phone')
      .populate({
        path: 'barberId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .populate('serviceId', 'name price duration');

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
      .populate({
        path: 'barberId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .populate('serviceId', 'name price duration')
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
    const { barberId, serviceId, appointmentDate, appointmentTime, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    let assignedBarberId = barberId || service.barberId || null;

    if (barberId) {
      const barber = await Barber.findById(barberId);
      if (!barber || !barber.isActive) {
        throw new AppError('Selected barber is not available', 404);
      }
    }

    if (
      service.barberId &&
      assignedBarberId &&
      String(service.barberId) !== String(assignedBarberId)
    ) {
      throw new AppError(
        'This service belongs to a different barber. Please choose the matching barber or service.',
        400
      );
    }

    if (assignedBarberId) {
      const existingAppointment = await Appointment.findOne({
        barberId: assignedBarberId,
        appointmentDate: {
          $gte: new Date(appointmentDate).setHours(0, 0, 0),
          $lte: new Date(appointmentDate).setHours(23, 59, 59),
        },
        appointmentTime,
        status: { $in: ['scheduled', 'completed'] },
      });

      if (existingAppointment) {
        throw new AppError(
          'Barber is not available at this time. Please choose another time slot.',
          409
        );
      }
    }

    const appointment = new Appointment({
      customerId: req.user.userId,
      barberId: assignedBarberId,
      serviceId,
      appointmentDate,
      appointmentTime,
      duration: service.duration,
      price: service.price,
      notes,
    });

    await appointment.save();
    await appointment.populate([
      { path: 'serviceId', select: 'name price duration' },
      {
        path: 'barberId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      },
    ]);

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
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate({
        path: 'barberId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .populate('serviceId', 'name price duration');

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
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name price duration category')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

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
    await appointment.populate([
      { path: 'customerId', select: 'name email phone' },
      { path: 'serviceId', select: 'name price duration category' },
    ]);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
