/**
 * In-memory sliding-window rate limiter for sensitive authentication endpoints
 * Protects against brute-force attacks, credential stuffing, and OTP enumeration
 */

const memoryStore = new Map();

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Factory to create rate limiting middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum allowed requests per window
 * @param {string} options.message - Error message when limit is exceeded
 * @param {boolean} options.keyGenerator - Custom key generator function
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 mins default
  max = 10,
  message = 'Too many attempts. Please try again later.',
  keyGenerator = null,
} = {}) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown-ip';
    const key = keyGenerator ? keyGenerator(req, ip) : `${req.baseUrl || ''}${req.path}:${ip}`;

    const now = Date.now();
    let record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      memoryStore.set(key, record);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

// Specialized rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 min per IP/email
  message: 'Too many login attempts from this IP. Please wait 15 minutes before trying again.',
  keyGenerator: (req, ip) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    return `login:${ip}:${email || 'none'}`;
  },
});

export const otpVerifyRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8, // 8 OTP attempts per 15 min
  message: 'Too many verification attempts. Please wait 15 minutes or request a new code.',
  keyGenerator: (req, ip) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    return `otp:${ip}:${email || 'none'}`;
  },
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 password reset requests per 15 min
  message: 'Too many password reset requests. Please check your inbox or try again in 15 minutes.',
  keyGenerator: (req, ip) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    return `pwd-reset:${ip}:${email || 'none'}`;
  },
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  max: 15, // 15 registrations per 30 min per IP
  message: 'Too many accounts created from this IP. Please try again later.',
  keyGenerator: (req, ip) => `register:${ip}`,
});
