import { body, validationResult } from 'express-validator';

const objectIdPattern = /^[a-f\d]{24}$/i;

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('phone')
    .notEmpty()
    .withMessage('Mobile number is required')
    .bail()
    .custom((value) => {
      let digits = String(value || '').replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.slice(2);
      }
      if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
        throw new Error('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9');
      }
      return true;
    }),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email is required'),
];

export const validateVerifyEmail = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
];

export const validateResendVerification = [
  body('email').isEmail().withMessage('Valid email is required'),
];

export const validateResetPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const validateService = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
];

export const validateAppointment = [
  body('barberId')
    .optional({ values: 'falsy' })
    .matches(objectIdPattern)
    .withMessage('Selected barber is invalid'),
  body('serviceIds')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('serviceIds.*')
    .matches(objectIdPattern)
    .withMessage('Selected service is invalid'),
  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .bail()
    .custom((value) => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      if (value < todayStr) {
        throw new Error('Appointment date cannot be in the past (yesterday or earlier)');
      }
      return true;
    }),
  body('appointmentTime')
    .notEmpty()
    .withMessage('Appointment time is required'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'online', 'card', 'upi', 'netbanking', 'wallet'])
    .withMessage('Payment method is invalid'),
];
