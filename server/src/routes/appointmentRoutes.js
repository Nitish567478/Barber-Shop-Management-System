import express from 'express';
import {
  getAllAppointments,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointmentById,
  getBarberAppointments,
  updateBarberAppointment,
  submitAppointmentFeedback,
} from '../controllers/appointmentController.js';
import { validateAppointment, validate } from '../validators/validators.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Barber routes
router.get('/barber/my-bookings', authorizeRole('barber'), getBarberAppointments);
router.put('/barber/:id', authorizeRole('barber'), updateBarberAppointment);

// User routes
router.get('/my-appointments', getUserAppointments);
router.post('/', validateAppointment, validate, createAppointment);
router.post('/:id/feedback', submitAppointmentFeedback);
router.get('/:id', getAppointmentById);

// Admin routes
router.get('/', authorizeRole('admin'), getAllAppointments);
router.put('/:id', authorizeRole('admin'), updateAppointment);
router.delete('/:id', cancelAppointment);

export default router;
