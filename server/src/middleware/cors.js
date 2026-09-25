import cors from 'cors';
import { config } from '../config/config.js';

/**
 * CORS Middleware Configuration
 * Handles Cross-Origin Resource Sharing for frontend and external API clients
 */
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Mobile apps, curl, server-to-server

  // Direct match with configured frontend URLs
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow trusted domain patterns (Vercel deployments & Render backend domains)
  if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
    return true;
  }

  // Allow localhost during development or testing
  if (config.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // Do NOT reflect arbitrary origin with credentials in production
    if (config.nodeEnv === 'production') {
      return callback(new Error(`CORS policy violation: Origin ${origin} is not allowed.`));
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
  maxAge: 3600, // 1 hour
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
