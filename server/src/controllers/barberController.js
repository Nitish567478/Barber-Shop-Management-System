import { Barber } from '../models/Barber.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all barbers
export const getAllBarbers = async (req, res, next) => {
  try {
    await Barber.updateMany(
      { suspendedUntil: { $lte: new Date() }, isActive: false },
      { $set: { isActive: true, suspensionReason: '' }, $unset: { suspendedUntil: '' } }
    );

    const barbers = await Barber.find({
      isActive: true,
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
    const barber = await Barber.findById(req.params.id).populate(
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
      shopImage,
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
      shopImage: shopImage || '',
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
      shopName,
      bio,
      location,
      shopImage,
      openingTime,
      closingTime,
      listingStatus,
      isApproved,
      staffMembers,
      slotCapacity,
    } = req.body;

    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      {
        specialization,
        experience,
        availability,
        isActive,
        shopName,
        bio,
        location,
        shopImage,
        openingTime,
        closingTime,
        listingStatus,
        isApproved,
        staffMembers,
        slotCapacity,
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
    const barber = await Barber.findById(req.params.id);

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
    const barber = await Barber.findOne({ userId: req.user.userId }).populate(
      'userId',
      'name email phone'
    );

    if (!barber) {
      throw new AppError('Barber profile not found', 404);
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
      shopImage,
      openingTime,
      closingTime,
      submitForApproval,
      staffMembers,
      slotCapacity,
    } = req.body;

    const normalizedSpecialization = Array.isArray(specialization)
      ? specialization
      : String(specialization || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const updates = {};
    if (normalizedSpecialization.length > 0) {
      updates.specialization = normalizedSpecialization;
    }
    if (experience !== undefined) {
      updates.experience = experience;
    }
    if (availability) {
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
    if (shopImage !== undefined) {
      updates.shopImage = shopImage;
    }
    if (openingTime !== undefined) {
      updates.openingTime = openingTime;
    }
    if (closingTime !== undefined) {
      updates.closingTime = closingTime;
    }
    if (staffMembers !== undefined) {
      updates.staffMembers = Array.isArray(staffMembers)
        ? staffMembers.map((item) => String(item).trim()).filter(Boolean)
        : String(staffMembers || '')
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }
    if (slotCapacity !== undefined) {
      updates.slotCapacity = Math.max(1, Number(slotCapacity) || 1);
    }

    if (submitForApproval === true) {
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
        listingApprovedAt: new Date(),
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
