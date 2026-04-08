import { Invoice } from '../models/Invoice.js';
import { Appointment } from '../models/Appointment.js';
import { generateInvoiceNumber } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all invoices
export const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'name email phone')
      .populate('barberId')
      .populate('appointmentId');

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// Get user invoices
export const getUserInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user.userId })
      .populate('barberId')
      .populate('appointmentId')
      .sort({ invoiceDate: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// Create invoice
export const createInvoice = async (req, res, next) => {
  try {
    const { appointmentId, paymentMethod, notes } = req.body;

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId).populate('serviceId');
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check if invoice already exists for this appointment
    const existingInvoice = await Invoice.findOne({ appointmentId });
    if (existingInvoice) {
      throw new AppError('Invoice already exists for this appointment', 409);
    }

    const invoice = new Invoice({
      appointmentId,
      customerId: appointment.customerId,
      barberId: appointment.barberId,
      invoiceNumber: generateInvoiceNumber(),
      amount: appointment.price,
      paymentMethod: paymentMethod || 'cash',
      notes,
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Update invoice payment status
export const updateInvoicePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('barberId')
      .populate('appointmentId');

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue statistics
export const getRevenueStats = async (req, res, next) => {
  try {
    const totalRevenue = await Invoice.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthlyRevenue = await Invoice.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json({
      success: true,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};
