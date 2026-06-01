import { User } from '../models/User.js';
import { Barber } from '../models/Barber.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';
import { config } from '../config/config.js';

// Register user
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      shopName,
      experience,
      specialization,
      bio,
      location,
    } = req.body;

    console.log('Register attempt for email:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      throw new AppError('This email is already registered. Please login or use a different email.', 409);
    }

    console.log('Email is available');

    // Normalize phone: if 10 digits, prepend +91; if already includes country code, keep +
    let normalizedPhone = phone ? String(phone).trim() : '';
    normalizedPhone = normalizedPhone.replace(/[^\d+]/g, '');
    if (normalizedPhone && !normalizedPhone.startsWith('+')) {
      const digits = normalizedPhone.replace(/^0+/, '');
      if (digits.length === 10) normalizedPhone = `+91${digits}`;
      else normalizedPhone = `+${digits}`;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: normalizedPhone,
      role: role || 'customer',
    });

    await user.save();

    if (user.role === 'barber') {
      const specializationList = Array.isArray(specialization)
        ? specialization
        : String(specialization || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

      await Barber.create({
        userId: user._id,
        shopName: shopName || `${name}'s Barber Studio`,
        experience: Number(experience) || 0,
        specialization:
          specializationList.length > 0 ? specializationList : ['haircut', 'shaving'],
        bio: bio || '',
        location: location || '',
        listingStatus: 'draft',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      console.error('E11000 Duplicate Key Error detected');
      console.error('   Check /api/reset endpoint to clear bad indexes');
      const field = Object.keys(error.keyValue || {})[0] || 'email';
      return next(new AppError(`This ${field} is already registered. If you're getting this error repeatedly, please try /api/reset endpoint.`, 409));
    }

    // Handle validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }

    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      throw new AppError('Invalid email or password', 401);
    }

    console.log('User found:', email);

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      throw new AppError('Invalid email or password', 401);
    }

    console.log('Password valid for:', email);

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log('Token generated for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      
    });
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      // Prefer configured FRONTEND_URL in production; if it points to localhost
      // (likely a leftover dev value) fall back to request origin or host.
      const frontendBase =
        config.frontendUrl && !/localhost|127\.0\.0\.1/.test(config.frontendUrl)
          ? config.frontendUrl
          : (req.headers.origin || `${req.protocol}://${req.get('host')}`);
      const resetUrl = `${frontendBase.replace(/\/+$/, '')}/reset-password/${rawToken}`;

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = expiresAt;
      await user.save();

      const delivery = await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name,
      });

      return res.json({
        success: true,
        message: 'If the email exists in our system, a reset link has been sent.',
        ...(delivery.delivered === false && config.nodeEnv !== 'production'
          ? { previewUrl: resetUrl }
          : {}),
      });
    }

    res.json({
      success: true,
      message: 'If the email exists in our system, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) {
      throw new AppError('Reset link is invalid or expired', 400);
    }

    user.password = await hashPassword(req.body.password);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, profilePicture } = req.body;

    let normalizedPhone = phone ? String(phone).trim() : '';
    normalizedPhone = normalizedPhone.replace(/[^\d+]/g, '');
    if (normalizedPhone && !normalizedPhone.startsWith('+')) {
      const digits = normalizedPhone.replace(/^0+/, '');
      if (digits.length === 10) normalizedPhone = `+91${digits}`;
      else normalizedPhone = `+${digits}`;
    }

    const updates = { name, phone: normalizedPhone };
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};
