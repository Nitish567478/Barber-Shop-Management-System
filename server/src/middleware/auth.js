import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (authHeader ? authHeader.trim() : null);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please sign in to continue.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verify user still exists in database and has not been deleted or deactivated
    const user = await User.findById(decoded.userId).select('role isActive isEmailVerified');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists. Please register or contact support.',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Attach real user record info to request
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    // Return HTTP 401 for token verification failures per standard RFC 7235
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid access token. Please sign in again.',
    });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions for this resource.',
      });
    }
    next();
  };
};

export default { authenticateToken, authorizeRole };
