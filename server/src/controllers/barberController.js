import { Barber } from '../models/Barber.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

const parseBarberStringArrayField = (value, maxItems = Infinity) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, maxItems);
  }

  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

const publicBarberFilters = {
  isActive: true,
  isOpen: { $ne: false },
  isApproved: true,
  $or: [{ listingStatus: 'approved' }, { listingStatus: { $exists: false } }],
};

// Get all barbers (supports location/city filtering to optimize DB load)
export const getAllBarbers = async (req, res, next) => {
  try {
    await Barber.updateMany(
      { suspendedUntil: { $lte: new Date() }, isActive: false },
      { $set: { isActive: true, suspensionReason: '' }, $unset: { suspendedUntil: '' } }
    );

    const { city, location, search, limit } = req.query;
    const filter = { ...publicBarberFilters };

    const locQuery = (city || location || '').trim();
    if (locQuery && locQuery.toLowerCase() !== 'all') {
      filter.location = { $regex: locQuery, $options: 'i' };
    } else if (search && search.trim()) {
      const s = search.trim();
      filter.$or = [
        { location: { $regex: s, $options: 'i' } },
        { shopName: { $regex: s, $options: 'i' } },
      ];
    }

    let query = Barber.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const parsedLimit = parseInt(limit, 10);
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      query = query.limit(parsedLimit);
    }

    const barbers = await query;

    res.json({
      success: true,
      count: barbers.length,
      filteredBy: locQuery || null,
      barbers,
    });
  } catch (error) {
    next(error);
  }
};

// Get all barber shops for admin, including suspended shops
export const getAdminBarbers = async (req, res, next) => {
  try {
    await Barber.updateMany(
      { suspendedUntil: { $lte: new Date() }, isActive: false },
      { $set: { isActive: true, suspensionReason: '' }, $unset: { suspendedUntil: '' } }
    );

    const barbers = await Barber.find({
      isApproved: true,
      $or: [{ listingStatus: 'approved' }, { listingStatus: { $exists: false } }],
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: barbers.length,
      barbers,
    });
  } catch (error) {
    next(error);
  }
};

// Get barber by ID
export const getBarberById = async (req, res, next) => {
  try {
    const barber = await Barber.findOne({
      _id: req.params.id,
      ...publicBarberFilters,
    }).populate(
      'userId',
      'name email phone'
    );

    if (!barber) {
      throw new AppError('Barber not found', 404);
    }

    res.json({
      success: true,
      barber,
    });
  } catch (error) {
    next(error);
  }
};

// Add barber (Admin only)
export const addBarber = async (req, res, next) => {
  try {
    const {
      userId,
      specialization,
      experience,
      shopName,
      bio,
      location,
      shopImages,
      openingTime,
      closingTime,
      staffMembers,
      slotCapacity,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existingBarber = await Barber.findOne({ userId });
    if (existingBarber) {
      throw new AppError('User is already registered as a barber', 409);
    }

    const barber = new Barber({
      userId,
      specialization: specialization || ['haircut', 'shaving'],
      experience: experience || 0,
      shopName: shopName || '',
      bio: bio || '',
      location: location || '',
      shopImages: Array.isArray(shopImages) ? shopImages.slice(0,5) : (shopImages ? [shopImages].slice(0,5) : []),
      openingTime: openingTime || '09:00',
      closingTime: closingTime || '18:00',
      staffMembers: Array.isArray(staffMembers) ? staffMembers : [],
      slotCapacity: Number(slotCapacity) || 3,
    });

    await barber.save();
    await barber.populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Barber added successfully',
      barber,
    });
  } catch (error) {
    next(error);
  }
};

// Update barber (Admin only)
export const updateBarber = async (req, res, next) => {
  try {
    const {
      specialization,
      experience,
      availability,
      isActive,
      isOpen,
      shopName,
      bio,
      location,
      shopImages,
      openingTime,
      closingTime,
      listingStatus,
      isApproved,
      staffMembers,
      slotCapacity,
    } = req.body;

    const normalizedShopImages = parseBarberStringArrayField(shopImages, 5);
    const normalizedStaffMembers = parseBarberStringArrayField(staffMembers);

    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      {
        specialization,
        experience,
        availability,
        isActive,
        isOpen,
        shopName,
        bio,
        location,
        ...(normalizedShopImages !== undefined ? { shopImages: normalizedShopImages } : {}),
        openingTime,
        closingTime,
        listingStatus,
        isApproved,
        ...(normalizedStaffMembers !== undefined ? { staffMembers: normalizedStaffMembers } : {}),
        ...(slotCapacity !== undefined ? { slotCapacity: Math.max(1, Number(slotCapacity) || 1) } : {}),
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!barber) {
      throw new AppError('Barber not found', 404);
    }

    res.json({
      success: true,
      message: 'Barber updated successfully',
      barber,
    });
  } catch (error) {
    next(error);
  }
};

// Get barber availability
export const getBarberAvailability = async (req, res, next) => {
  try {
    const barber = await Barber.findOne({
      _id: req.params.id,
      ...publicBarberFilters,
    });

    if (!barber) {
      throw new AppError('Barber not found', 404);
    }

    res.json({
      success: true,
      availability: barber.availability,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBarberProfile = async (req, res, next) => {
  try {
    let barber = await Barber.findOne({ userId: req.user.userId }).populate(
      'userId',
      'name email phone'
    );

    if (!barber) {
      // Auto-create initial profile for barber user if missing
      const user = await User.findById(req.user.userId);
      if (user && user.role === 'barber') {
        barber = await Barber.create({
          userId: user._id,
          shopName: `${user.name}'s Barber Studio`,
          specialization: ['haircut', 'shaving'],
          listingStatus: 'draft',
          isApproved: false,
          isActive: true,
          isOpen: true,
        });
        await barber.populate('userId', 'name email phone');
      } else {
        throw new AppError('Barber profile not found', 404);
      }
    }

    res.json({
      success: true,
      barber,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyBarberProfile = async (req, res, next) => {
  try {
    const {
      specialization,
      experience,
      availability,
      shopName,
      bio,
      location,
      isActive,
      isOpen,
      shopImages,
      openingTime,
      closingTime,
      submitForApproval,
      staffMembers,
      slotCapacity,
      payoutDetails,
    } = req.body;

    const normalizedSpecialization = specialization !== undefined
      ? Array.isArray(specialization)
        ? specialization
        : String(specialization)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
      : undefined;

    const updates = {};
    if (specialization !== undefined) {
      updates.specialization = normalizedSpecialization;
    }
    if (experience !== undefined) {
      updates.experience = experience;
    }
    if (availability !== undefined) {
      updates.availability = availability;
    }
    if (shopName !== undefined) {
      updates.shopName = shopName;
    }
    if (bio !== undefined) {
      updates.bio = bio;
    }
    if (location !== undefined) {
      updates.location = location;
    }
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }
    if (isOpen !== undefined) {
      updates.isOpen = Boolean(isOpen);
    }
    if (shopImages !== undefined) {
      const normalizedShopImages = parseBarberStringArrayField(shopImages, 5);
      updates.shopImages = normalizedShopImages || [];
    }
    if (openingTime !== undefined) {
      updates.openingTime = openingTime;
    }
    if (closingTime !== undefined) {
      updates.closingTime = closingTime;
    }
    if (staffMembers !== undefined) {
      updates.staffMembers = parseBarberStringArrayField(staffMembers) || [];
    }
    if (slotCapacity !== undefined) {
      updates.slotCapacity = Math.max(1, Number(slotCapacity) || 1);
    }

    if (payoutDetails !== undefined && typeof payoutDetails === 'object' && payoutDetails !== null) {
      const existingBarber = await Barber.findOne({ userId: req.user.userId });
      const currentPayout = existingBarber?.payoutDetails || {};

      const inUpi = payoutDetails.upiId !== undefined ? String(payoutDetails.upiId).trim() : '';
      const inHolder = payoutDetails.accountHolderName !== undefined ? String(payoutDetails.accountHolderName).trim() : '';
      const inAcc = payoutDetails.accountNumber !== undefined ? String(payoutDetails.accountNumber).trim() : '';
      const inIfsc = payoutDetails.ifscCode !== undefined ? String(payoutDetails.ifscCode).trim().toUpperCase() : '';
      const inBank = payoutDetails.bankName !== undefined ? String(payoutDetails.bankName).trim() : '';

      updates.payoutDetails = {
        upiId: inUpi || currentPayout.upiId || '',
        accountHolderName: inHolder || currentPayout.accountHolderName || '',
        accountNumber: inAcc || currentPayout.accountNumber || '',
        ifscCode: inIfsc || currentPayout.ifscCode || '',
        bankName: inBank || currentPayout.bankName || '',
        accountType: ['savings', 'current'].includes(payoutDetails.accountType) ? payoutDetails.accountType : (currentPayout.accountType || 'savings'),
        isPaymentActive: payoutDetails.isPaymentActive !== undefined ? Boolean(payoutDetails.isPaymentActive) : (currentPayout.isPaymentActive !== false),
      };

      // Only perform strict validation if actively submitting the payout form or submitting for approval
      if (req.body.isPayoutFormSubmission === true || req.body.validatePayout === true) {
        const pd = updates.payoutDetails;
        if (!pd.upiId || !pd.upiId.includes('@')) {
          throw new AppError('Valid UPI ID containing @ is required (e.g., yourname@okhdfcbank)', 400);
        }
        if (!pd.accountHolderName || pd.accountHolderName.length < 2) {
          throw new AppError('Account holder name is required', 400);
        }
        if (!pd.bankName || pd.bankName.length < 2) {
          throw new AppError('Bank name is required', 400);
        }
        if (!pd.accountNumber || pd.accountNumber.length < 9) {
          throw new AppError('Valid bank account number (at least 9 digits) is required', 400);
        }
        if (!pd.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(pd.ifscCode)) {
          throw new AppError('Valid 11-character IFSC code is required (e.g., SBIN0001234)', 400);
        }
      }
    }

    if (submitForApproval === true) {
      const existingBarber = await Barber.findOne({ userId: req.user.userId });
      const payout = updates.payoutDetails || existingBarber?.payoutDetails || {};
      if (!payout.upiId || !payout.accountNumber || !payout.ifscCode || !payout.bankName || !payout.accountHolderName) {
        throw new AppError('Please complete all Bank Account and UPI details before submitting for admin approval', 400);
      }
      updates.listingStatus = 'pending';
      updates.listingRequestedAt = new Date();
      updates.listingApprovedAt = null;
      updates.isApproved = false;
    }

    const barber = await Barber.findOneAndUpdate({ userId: req.user.userId }, updates, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email phone');

    if (!barber) {
      throw new AppError('Barber profile not found', 404);
    }

    res.json({
      success: true,
      message: 'Barber profile updated successfully',
      barber,
    });
  } catch (error) {
    next(error);
  }
};

export const submitBarberListing = async (req, res, next) => {
  try {
    const barber = await Barber.findOne({ userId: req.user.userId }).populate(
      'userId',
      'name email phone'
    );

    if (!barber) {
      throw new AppError('Barber profile not found', 404);
    }

    if (!barber.shopName?.trim() || !barber.location?.trim()) {
      throw new AppError('Please complete shop name and location before submitting for approval', 400);
    }

    const payout = barber.payoutDetails || {};
    if (!payout.upiId?.trim() || !payout.accountNumber?.trim() || !payout.ifscCode?.trim() || !payout.bankName?.trim() || !payout.accountHolderName?.trim()) {
      throw new AppError('Please complete all Bank Account and UPI details in the Bank & UPI tab before submitting for admin approval', 400);
    }

    barber.listingStatus = 'pending';
    barber.listingRequestedAt = new Date();
    barber.listingApprovedAt = null;
    barber.isApproved = false;

    await barber.save();

    res.json({
      success: true,
      message: 'Your barber shop has been submitted for admin approval',
      barber,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending barber approvals (Admin only)
export const getPendingBarbers = async (req, res, next) => {
  try {
    const pendingBarbers = await Barber.find({ listingStatus: 'pending' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingBarbers.length,
      pendingBarbers,
    });
  } catch (error) {
    next(error);
  }
};

// Approve a barber (Admin only)
export const approveBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        listingStatus: 'approved',
        isActive: true,
        isOpen: true,
        listingApprovedAt: new Date(),
        suspendedUntil: null,
        suspensionReason: '',
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!barber) {
      throw new AppError('Barber not found', 404);
    }

    res.json({
      success: true,
      message: 'Barber approved successfully',
      barber,
    });
  } catch (error) {
    next(error);
  }
};

// Reject a barber (Admin only)
export const rejectBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        listingStatus: 'rejected',
        listingApprovedAt: null,
      },
      { new: true, runValidators: true }
    );

    if (!barber) {
      throw new AppError('Barber not found', 404);
    }

    res.json({
      success: true,
      message: 'Barber listing request rejected',
    });
  } catch (error) {
    next(error);
  }
};
