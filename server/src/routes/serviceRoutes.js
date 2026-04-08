import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
} from '../controllers/serviceController.js';
import { validateService, validate } from '../validators/validators.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/me/mine', authenticateToken, authorizeRole('barber'), getMyServices);
router.get('/:id', getServiceById);

// Admin and barber routes
router.post('/', authenticateToken, authorizeRole('admin', 'barber'), validateService, validate, createService);
router.put('/:id', authenticateToken, authorizeRole('admin', 'barber'), validateService, validate, updateService);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'barber'), deleteService);

export default router;
