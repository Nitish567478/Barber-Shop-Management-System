import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

// Generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate invoice number
export const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Calculate appointment end time
export const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};
