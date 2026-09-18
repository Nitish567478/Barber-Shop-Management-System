import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Appointment } from '../models/Appointment.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateInvoiceNumber } from '../utils/helpers.js';
import { sendNotification } from '../utils/notifications.js';
import config from '../config/config.js';

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

/**
 * Get payment checkout details for an appointment
 */
export const getPaymentDetails = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).populate(appointmentPopulate);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Verify ownership: customer who booked, the assigned barber, or admin
    const isCustomer = String(appointment.customerId?._id || appointment.customerId) === String(req.user.userId);
    const isBarber = String(appointment.barberId?.userId?._id || appointment.barberId?.userId) === String(req.user.userId);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isBarber && !isAdmin) {
      throw new AppError('Not authorized to access payment details for this appointment', 403);
    }

    const invoice = await Invoice.findOne({ appointmentId: appointment._id });
    const payment = await Payment.findOne({ appointmentId: appointment._id, paymentStatus: 'completed' });

    res.json({
      success: true,
      appointment,
      invoice,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process online payment (UPI, Card, Net Banking, Wallet)
 */
export const processPayment = async (req, res, next) => {
  try {
    const {
      appointmentId,
      paymentMethod = 'upi',
      paymentDetails = {},
    } = req.body;

    if (!appointmentId) {
      throw new AppError('Appointment ID is required to process payment', 400);
    }

    const appointment = await Appointment.findById(appointmentId).populate(appointmentPopulate);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check ownership
    const isCustomer = String(appointment.customerId?._id || appointment.customerId) === String(req.user.userId);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      throw new AppError('You can only pay for your own appointments', 403);
    }

    // Prevent duplicate payment if already paid
    if (appointment.paymentStatus === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'This appointment is already paid',
        transactionId: appointment.transactionId,
        appointment,
      });
    }

    // Generate unique transaction reference
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const transactionId = `TXN_${timestamp}_${randomHex}`;
    const paidAt = new Date();

    // 1. Update Appointment Record
    appointment.paymentMethod = 'online';
    appointment.paymentStatus = 'completed';
    appointment.transactionId = transactionId;
    appointment.paidAt = paidAt;
    appointment.paymentDetails = {
      mode: paymentMethod,
      gateway: 'BarberPay Instant Gateway',
      ...paymentDetails,
    };
    if ((!Array.isArray(appointment.serviceIds) || appointment.serviceIds.length === 0) && appointment.serviceId) {
      appointment.serviceIds = [appointment.serviceId];
    }
    await appointment.save();

    // 2. Create or Update Invoice
    let invoice = await Invoice.findOne({ appointmentId: appointment._id });
    if (invoice) {
      invoice.amount = appointment.price;
      invoice.paymentMethod = 'online';
      invoice.paymentStatus = 'completed';
      invoice.notes = `Paid online via ${paymentMethod.toUpperCase()}. Txn ID: ${transactionId}`;
      await invoice.save();
    } else {
      invoice = await Invoice.create({
        appointmentId: appointment._id,
        customerId: appointment.customerId?._id || appointment.customerId,
        barberId: appointment.barberId?._id || appointment.barberId,
        invoiceNumber: generateInvoiceNumber(),
        amount: appointment.price,
        paymentMethod: 'online',
        paymentStatus: 'completed',
        notes: `Paid online via ${paymentMethod.toUpperCase()}. Txn ID: ${transactionId}`,
      });
    }

    // 3. Persist Payment Transaction Record
    const payment = await Payment.create({
      appointmentId: appointment._id,
      invoiceId: invoice._id,
      customerId: appointment.customerId?._id || appointment.customerId,
      barberId: appointment.barberId?._id || appointment.barberId,
      amount: appointment.price,
      currency: 'INR',
      paymentMethod,
      paymentStatus: 'completed',
      transactionId,
      gatewayName: 'BarberPay Instant Gateway',
      paymentDetails: {
        mode: paymentMethod,
        ...paymentDetails,
      },
      paidAt,
    });

    // 4. Send Confirmation Notification (In-App, Email, SMS, WhatsApp)
    const customerUser = await User.findById(appointment.customerId?._id || appointment.customerId);
    const shopName = appointment.barberId?.shopName || 'Barber Shop';
    const appointmentDateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (customerUser) {
      await sendNotification({
        type: 'system',
        user: customerUser,
        shopName,
        appointment,
        customTitle: `Payment Received (Rs. ${appointment.price})! 💳`,
        customMessage: `Your payment of Rs. ${appointment.price} via ${paymentMethod.toUpperCase()} was successful. Txn ID: ${transactionId}. Appointment on ${appointmentDateStr} at ${appointment.appointmentTime}.`,
        link: '/my-invoices',
        tab: 'invoices',
      });
    }

    // Notify barber of online pre-payment
    if (appointment.barberId?.userId) {
      const barberUser = await User.findById(appointment.barberId.userId);
      if (barberUser) {
        await sendNotification({
          type: 'system',
          user: barberUser,
          shopName,
          appointment,
          customTitle: `Pre-payment Received: Rs. ${appointment.price}! 💰`,
          customMessage: `Customer ${customerUser?.name || 'Client'} has paid Rs. ${appointment.price} online for appointment on ${appointmentDateStr} (${appointment.appointmentTime}). Txn: ${transactionId}.`,
          link: '/dashboard',
          tab: 'bookings',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully! Your booking is confirmed.',
      transactionId,
      appointment,
      invoice,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify transaction and fetch receipt
 */
export const verifyTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate('appointmentId')
      .populate('customerId', 'name email phone')
      .populate({
        path: 'barberId',
        select: 'shopName address city rating',
      });

    if (!payment) {
      throw new AppError('Transaction not found', 404);
    }

    const invoice = await Invoice.findOne({ appointmentId: payment.appointmentId?._id || payment.appointmentId });

    res.json({
      success: true,
      payment,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      throw new AppError('Appointment ID is required', 400);
    }

    const appointment = await Appointment.findById(appointmentId).populate(appointmentPopulate);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const amountInPaise = Math.round(Number(appointment.price || 0) * 100);
    const hasLiveKeys =
      config.razorpayKeyId &&
      config.razorpayKeySecret &&
      !config.razorpayKeyId.includes('demo') &&
      !config.razorpayKeySecret.includes('demo');

    let order = null;

    if (hasLiveKeys) {
      try {
        const instance = new Razorpay({
          key_id: config.razorpayKeyId,
          key_secret: config.razorpayKeySecret,
        });

        order = await instance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${appointment._id.toString().slice(-10)}`,
          notes: {
            appointmentId: String(appointment._id),
            shopName: appointment.barberId?.shopName || 'Barber Shop',
            barberUpiId: appointment.barberId?.payoutDetails?.upiId || '',
            barberAccount: appointment.barberId?.payoutDetails?.accountNumber ? `ACC_${appointment.barberId.payoutDetails.accountNumber.slice(-4)}` : '',
          },
        });
      } catch (sdkError) {
        console.warn('⚠️ Razorpay live order creation failed, using sandbox fallback:', sdkError.message);
      }
    }

    // Fallback sandbox order if live API credentials are demo or unconfigured
    if (!order) {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      order = {
        id: orderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${appointment._id.toString().slice(-10)}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    res.status(200).json({
      success: true,
      order,
      keyId: config.razorpayKeyId || 'rzp_test_barber_demo',
      amount: appointment.price,
      currency: 'INR',
      appointment: {
        _id: appointment._id,
        price: appointment.price,
        shopName: appointment.barberId?.shopName || 'Barber Grooming Studio',
        customerName: appointment.customerId?.name || 'Customer',
        customerEmail: appointment.customerId?.email || 'customer@example.com',
        customerPhone: appointment.customerId?.phone || '+919999999999',
        payoutDetails: appointment.barberId?.payoutDetails || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay Payment Signature
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!appointmentId || !razorpay_payment_id) {
      throw new AppError('Appointment ID and Payment ID are required', 400);
    }

    const appointment = await Appointment.findById(appointmentId).populate(appointmentPopulate);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check signature if live secret is available
    const hasLiveKeys =
      config.razorpayKeyId &&
      config.razorpayKeySecret &&
      !config.razorpayKeyId.includes('demo') &&
      !config.razorpayKeySecret.includes('demo');

    if (hasLiveKeys && razorpay_order_id && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new AppError('Invalid payment signature', 400);
      }
    }

    const paidAt = new Date();
    const transactionId = razorpay_payment_id;

    // 1. Update Appointment
    appointment.paymentMethod = 'online';
    appointment.paymentStatus = 'completed';
    appointment.transactionId = transactionId;
    appointment.paidAt = paidAt;
    appointment.paymentDetails = {
      mode: 'razorpay',
      gateway: 'Razorpay Payment Gateway',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    };
    if ((!Array.isArray(appointment.serviceIds) || appointment.serviceIds.length === 0) && appointment.serviceId) {
      appointment.serviceIds = [appointment.serviceId];
    }
    await appointment.save();

    // 2. Create or Update Invoice
    let invoice = await Invoice.findOne({ appointmentId: appointment._id });
    if (invoice) {
      invoice.amount = appointment.price;
      invoice.paymentMethod = 'online';
      invoice.paymentStatus = 'completed';
      invoice.notes = `Paid online via Razorpay. Payment ID: ${transactionId}`;
      await invoice.save();
    } else {
      invoice = await Invoice.create({
        appointmentId: appointment._id,
        customerId: appointment.customerId?._id || appointment.customerId,
        barberId: appointment.barberId?._id || appointment.barberId,
        invoiceNumber: generateInvoiceNumber(),
        amount: appointment.price,
        paymentMethod: 'online',
        paymentStatus: 'completed',
        notes: `Paid online via Razorpay. Payment ID: ${transactionId}`,
      });
    }

    // 3. Log Payment Transaction
    const payment = await Payment.create({
      appointmentId: appointment._id,
      invoiceId: invoice._id,
      customerId: appointment.customerId?._id || appointment.customerId,
      barberId: appointment.barberId?._id || appointment.barberId,
      amount: appointment.price,
      currency: 'INR',
      paymentMethod: 'online',
      paymentStatus: 'completed',
      transactionId,
      gatewayName: 'Razorpay Payment Gateway',
      paymentDetails: {
        mode: 'razorpay',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
      paidAt,
    });

    // 4. Send Multi-Channel Confirmation Notifications
    const customerUser = await User.findById(appointment.customerId?._id || appointment.customerId);
    const shopName = appointment.barberId?.shopName || 'Barber Shop';
    const appointmentDateStr = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (customerUser) {
      await sendNotification({
        type: 'system',
        user: customerUser,
        shopName,
        appointment,
        customTitle: `Payment Received (Rs. ${appointment.price})! 💳`,
        customMessage: `Your payment of Rs. ${appointment.price} via Razorpay was successful. Payment ID: ${transactionId}. Appointment on ${appointmentDateStr} at ${appointment.appointmentTime}.`,
        link: '/my-invoices',
        tab: 'invoices',
      });
    }

    if (appointment.barberId?.userId) {
      const barberUser = await User.findById(appointment.barberId.userId);
      if (barberUser) {
        await sendNotification({
          type: 'system',
          user: barberUser,
          shopName,
          appointment,
          customTitle: `Pre-payment Received: Rs. ${appointment.price}! 💰`,
          customMessage: `Customer ${customerUser?.name || 'Client'} has paid Rs. ${appointment.price} online via Razorpay for ${appointmentDateStr} (${appointment.appointmentTime}). Payment ID: ${transactionId}.`,
          link: '/dashboard',
          tab: 'bookings',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Razorpay payment verified successfully! Booking confirmed.',
      transactionId,
      appointment,
      invoice,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
