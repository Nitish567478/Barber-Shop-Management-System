import cors from 'cors';
import { config } from '../config/config.js';

/**
 * CORS Middleware Configuration
 * Handles Cross-Origin Resource Sharing for frontend and external API clients
 */
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600, // 1 hour
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
