import express from 'express';
import {
  getAllInvoices,
  getUserInvoices,
  createInvoice,
  updateInvoicePaymentStatus,
  getInvoiceById,
  getRevenueStats,
} from '../controllers/invoiceController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/my-invoices', getUserInvoices);

// Admin routes
router.get('/', authorizeRole('admin'), getAllInvoices);
router.post('/', authorizeRole('admin'), createInvoice);
router.put('/:id', authorizeRole('admin'), updateInvoicePaymentStatus);
router.get('/stats/revenue', authorizeRole('admin'), getRevenueStats);
router.get('/:id', getInvoiceById);

export default router;
