import express from 'express';
import {
  getAllBarbers,
  getBarberById,
  addBarber,
  updateBarber,
  getBarberAvailability,
  getMyBarberProfile,
  updateMyBarberProfile,
  submitBarberListing,
  getAdminBarbers,
  getPendingBarbers,
  approveBarber,
  rejectBarber,
} from '../controllers/barberController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBarbers);
router.get('/me/profile', authenticateToken, authorizeRole('barber'), getMyBarberProfile);
router.put('/me/profile', authenticateToken, authorizeRole('barber'), updateMyBarberProfile);
router.post('/me/submit-listing', authenticateToken, authorizeRole('barber'), submitBarberListing);

// Admin routes - specific before parameterized
router.get('/admin/pending', authenticateToken, authorizeRole('admin'), getPendingBarbers);
router.get('/admin/all', authenticateToken, authorizeRole('admin'), getAdminBarbers);
router.put('/admin/:id/approve', authenticateToken, authorizeRole('admin'), approveBarber);
router.delete('/admin/:id/reject', authenticateToken, authorizeRole('admin'), rejectBarber);

// Parameterized public routes
router.get('/:id', getBarberById);
router.get('/:id/availability', getBarberAvailability);

// Admin routes - general
router.post('/', authenticateToken, authorizeRole('admin'), addBarber);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateBarber);

export default router;
