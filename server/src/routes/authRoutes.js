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
import {
  loginRateLimiter,
  registerRateLimiter,
  otpVerifyRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Auth routes with rate limiting, input validation, and security controls
router.post('/register', registerRateLimiter, validateRegister, validate, register);
router.post('/login', loginRateLimiter, validateLogin, validate, login);
router.post('/verify-email', otpVerifyRateLimiter, validateVerifyEmail, validate, verifyBarberEmail);
router.post('/resend-verification', passwordResetRateLimiter, validateResendVerification, validate, resendBarberVerification);
router.post('/forgot-password', passwordResetRateLimiter, validateForgotPassword, validate, forgotPassword);
router.post('/reset-password/:token', passwordResetRateLimiter, validateResetPassword, validate, resetPassword);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

export default router;
