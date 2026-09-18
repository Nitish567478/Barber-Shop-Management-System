import { User } from '../models/User.js';
import { Barber } from '../models/Barber.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendPasswordResetEmail, sendBarberVerificationEmail } from '../utils/email.js';
import { sendNotification } from '../utils/notifications.js';
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

    // Strictly require and validate 10-digit mobile number
    let rawPhone = phone ? String(phone).trim().replace(/\D/g, '') : '';
    if (rawPhone.length === 12 && rawPhone.startsWith('91')) {
      rawPhone = rawPhone.slice(2);
    }
    if (rawPhone.length !== 10 || !/^[6-9]\d{9}$/.test(rawPhone)) {
      throw new AppError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9', 400);
    }
    const normalizedPhone = `+91${rawPhone}`;

    // Hash password
    const hashedPassword = await hashPassword(password);

    const isBarber = role === 'barber';

    // If registering as a barber, require email verification with 6-digit OTP
    let otpCode = null;
    let otpExpires = null;
    if (isBarber) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    }

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: normalizedPhone,
      role: role || 'customer',
      isEmailVerified: !isBarber, // Customers are verified immediately, barbers require OTP verification
      emailVerificationOTP: otpCode,
      emailVerificationExpires: otpExpires,
    });

    await user.save();

    if (isBarber) {
      const specializationList = Array.isArray(specialization)
        ? specialization
        : String(specialization || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

      const studioName = shopName || `${name}'s Barber Studio`;

      await Barber.create({
        userId: user._id,
        shopName: studioName,
        experience: Number(experience) || 0,
        specialization:
          specializationList.length > 0 ? specializationList : ['haircut', 'shaving'],
        bio: bio || '',
        location: location || '',
        listingStatus: 'draft',
      });

      // Send 6-digit OTP email to the Barber
      const delivery = await sendBarberVerificationEmail({
        to: user.email,
        userName: user.name,
        shopName: studioName,
        otpCode,
      });

      console.log(`✂️ [BARBER VERIFICATION] OTP sent to ${user.email}: ${otpCode}`);

      return res.status(201).json({
        success: true,
        requireVerification: true,
        message: 'Barber account created! A 6-digit verification code has been sent to your email.',
        email: user.email,
        shopName: studioName,
        ...(delivery?.simulated ? { previewOtp: otpCode } : {}),
      });
    }

    // Generate token for customer
    const token = generateToken(user._id, user.role);

    // Send multi-channel welcome notification for customer
    try {
      await sendNotification({
        type: 'welcome',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        shopName: 'Barabar Shop',
        link: '/barbers',
      });
    } catch (notifErr) {
      console.warn('⚠️ Welcome notification error:', notifErr.message);
    }

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
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      console.error('E11000 Duplicate Key Error detected');
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

// Verify Barber Email OTP
export const verifyBarberEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new AppError('Email and 6-digit verification code are required', 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail })
      .select('+emailVerificationOTP +emailVerificationExpires');

    if (!user) {
      throw new AppError('No account found with this email address', 404);
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. You can sign in directly.',
      });
    }

    if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
      throw new AppError('No active verification code found. Please request a new code.', 400);
    }

    if (new Date() > user.emailVerificationExpires) {
      throw new AppError('The verification code has expired. Please request a new code.', 400);
    }

    if (String(user.emailVerificationOTP).trim() !== cleanOtp) {
      throw new AppError('Invalid verification code. Please check and try again.', 400);
    }

    // Mark user email as verified and clear OTP
    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Generate login token
    const token = generateToken(user._id, user.role);

    // Send welcome notification now that email is verified
    try {
      await sendNotification({
        type: 'welcome',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        shopName: 'Barabar Shop',
        link: '/dashboard',
      });
    } catch (notifErr) {
      console.warn('⚠️ Welcome notification error:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to Barabar Shop.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: true,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend Barber Verification OTP
export const resendBarberVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email address is required', 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail })
      .select('+emailVerificationOTP +emailVerificationExpires');

    if (!user) {
      throw new AppError('No account found with this email address', 404);
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'This email is already verified. You can sign in directly.',
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationOTP = otpCode;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const barber = await Barber.findOne({ userId: user._id });

    const delivery = await sendBarberVerificationEmail({
      to: user.email,
      userName: user.name,
      shopName: barber?.shopName || 'Barber Studio',
      otpCode,
    });

    res.json({
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
      email: user.email,
      ...(delivery?.simulated ? { previewOtp: otpCode } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user by email with verification fields
    const user = await User.findOne({ email }).select(
      '+password +emailVerificationOTP +emailVerificationExpires'
    );
    if (!user) {
      console.log('User not found:', email);
      throw new AppError('Invalid email or password', 401);
    }

    console.log('User found:', email);

    // Compare password safely even if the record lacks a hashed password
    const hashedPassword = String(user.password || '');
    const isPasswordValid = await comparePassword(password, hashedPassword);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      throw new AppError('Invalid email or password', 401);
    }

    console.log('Password valid for:', email);

    // If barber has not verified email, block login and prompt for verification
    if (user.role === 'barber' && !user.isEmailVerified) {
      const hasActiveOtp =
        user.emailVerificationOTP &&
        user.emailVerificationExpires &&
        new Date() < user.emailVerificationExpires;

      let otpCode = user.emailVerificationOTP;
      let delivery = null;

      if (!hasActiveOtp) {
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationOTP = otpCode;
        user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const barber = await Barber.findOne({ userId: user._id });
        delivery = await sendBarberVerificationEmail({
          to: user.email,
          userName: user.name,
          shopName: barber?.shopName || 'Barber Studio',
          otpCode,
        });
      }

      return res.status(403).json({
        success: false,
        requireVerification: true,
        message: 'Your Barber Studio email is not verified yet. A verification code has been sent to your email.',
        email: user.email,
        previewOtp: otpCode,
      });
    }

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
        isEmailVerified: user.isEmailVerified,
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

    let normalizedPhone;
    if (phone !== undefined) {
      let rawPhone = String(phone).trim().replace(/\D/g, '');
      if (rawPhone.length === 12 && rawPhone.startsWith('91')) {
        rawPhone = rawPhone.slice(2);
      }
      if (rawPhone.length !== 10 || !/^[6-9]\d{9}$/.test(rawPhone)) {
        throw new AppError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9', 400);
      }
      normalizedPhone = `+91${rawPhone}`;
    }

    const updates = { name };
    if (normalizedPhone !== undefined) updates.phone = normalizedPhone;
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
