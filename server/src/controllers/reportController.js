import { Appointment } from '../models/Appointment.js';
import { Barber } from '../models/Barber.js';
import { Report } from '../models/Report.js';
import { AppError } from '../middleware/errorHandler.js';

const reportPopulate = [
  { path: 'customerId', select: 'name email phone' },
  {
    path: 'barberId',
    populate: {
      path: 'userId',
      select: 'name email phone',
    },
  },
  {
    path: 'appointmentId',
    select: 'appointmentDate appointmentTime status price feedback selectedStaffName',
  },
];

export const createReport = async (req, res, next) => {
  try {
    const { appointmentId, barberId, category = 'other', message } = req.body;

    if (!message?.trim()) {
      throw new AppError('Please describe the issue', 400);
    }

    let targetBarberId = barberId;
    let appointment = null;

    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }
      if (String(appointment.customerId) !== String(req.user.userId)) {
        throw new AppError('You can only report your own appointment', 403);
      }
      targetBarberId = appointment.barberId;
    }

    if (!targetBarberId) {
      throw new AppError('Please select a barber shop to report', 400);
    }

    const barber = await Barber.findById(targetBarberId);
    if (!barber) {
      throw new AppError('Barber shop not found', 404);
    }

    const report = await Report.create({
      customerId: req.user.userId,
      barberId: targetBarberId,
      appointmentId: appointment?._id || null,
      category,
      message: message.trim(),
      priority: ['behavior', 'hygiene'].includes(category) ? 'high' : 'medium',
    });

    await report.populate(reportPopulate);

    res.status(201).json({
      success: true,
      message: 'Report submitted to admin for verification',
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate(reportPopulate)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyReport = async (req, res, next) => {
  try {
    const {
      status = 'verified',
      adminNote = '',
      actionType = 'warning',
      suspendedDays = 3,
    } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    if (!['verified', 'rejected', 'resolved'].includes(status)) {
      throw new AppError('Invalid report status', 400);
    }

    report.status = status;
    report.adminNote = adminNote;
    report.actionType = status === 'verified' ? actionType : 'none';
    report.verifiedAt = status === 'verified' ? new Date() : report.verifiedAt;
    report.resolvedAt = ['rejected', 'resolved'].includes(status) ? new Date() : null;

    if (status === 'verified' && actionType === 'suspended') {
      const days = Math.max(1, Number(suspendedDays) || 3);
      const suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + days);

      report.suspendedDays = days;
      await Barber.findByIdAndUpdate(report.barberId, {
        isActive: false,
        suspendedUntil,
        suspensionReason: adminNote || report.message,
      });
    }

    await report.save();
    await report.populate(reportPopulate);

    res.json({
      success: true,
      message: 'Report reviewed successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};
