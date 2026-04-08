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
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
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
  body('serviceId')
    .notEmpty()
    .withMessage('Service selection is required')
    .matches(objectIdPattern)
    .withMessage('Selected service is invalid'),
  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required'),
  body('appointmentTime')
    .notEmpty()
    .withMessage('Appointment time is required'),
];
