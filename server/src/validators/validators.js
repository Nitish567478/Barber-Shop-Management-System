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
    .withMessage('Phone number is required')
    .bail()
    .custom((value) => {
      // allow formats like 9876543210 or +919876543210
      const normalized = String(value).replace(/[^\d+]/g, '');
      const pure = normalized.replace(/^\+/, '');
      if (!/^[0-9]{10,12}$/.test(pure)) {
        throw new Error('Phone must be 10 digits (with optional country code)');
      }
      // if a country code exists, ensure it is +91 or length matches
      if (pure.length === 11 && !pure.startsWith('91')) {
        throw new Error('Invalid country code, expected +91 for 11-digit numbers');
      }
      if (pure.length > 12) {
        throw new Error('Phone number too long');
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
    .withMessage('Appointment date is required'),
  body('appointmentTime')
    .notEmpty()
    .withMessage('Appointment time is required'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'online'])
    .withMessage('Payment method is invalid'),
];
