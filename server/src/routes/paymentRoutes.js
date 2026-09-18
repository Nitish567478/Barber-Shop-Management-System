import express from 'express';
import {
  getPaymentDetails,
  processPayment,
  verifyTransaction,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/appointment/:appointmentId', getPaymentDetails);
router.post('/process', processPayment);
router.get('/verify/:transactionId', verifyTransaction);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
