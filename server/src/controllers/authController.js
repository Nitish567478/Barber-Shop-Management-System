import { User } from '../models/User.js';
import { Barber } from '../models/Barber.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

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

    console.log('📝 Register attempt for email:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      throw new AppError('This email is already registered. Please login or use a different email.', 409);
    }

    console.log('✓ Email is available');

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
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
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    
    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      console.error('❌ E11000 Duplicate Key Error detected');
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
    console.log('🔐 Login attempt for:', email);

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      throw new AppError('Invalid email or password', 401);
    }

    console.log('✓ User found:', email);

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      throw new AppError('Invalid email or password', 401);
    }

    console.log('✓ Password valid for:', email);

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log('✓ Token generated for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
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
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone },
      { new: true, runValidators: true }
    );

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
