import express from 'express';
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validate,
} from '../validators/validators.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

export default router;
