import express from 'express';
import {
  register,
  login,
  verifyBarberEmail,
  resendBarberVerification,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validate,
} from '../validators/validators.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);
router.post('/verify-email', validateVerifyEmail, validate, verifyBarberEmail);
router.post('/resend-verification', validateResendVerification, validate, resendBarberVerification);
router.post('/forgot-password', validateForgotPassword, validate, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, validate, resetPassword);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

export default router;
