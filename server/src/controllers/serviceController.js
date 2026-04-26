import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all services
export const getAllServices = async (req, res, next) => {
  try {
    const filters = { isActive: true };
    if (req.query.barberId) {
      filters.barberId = req.query.barberId;
    }

    const services = await Service.find(filters)
      .populate({
        path: 'barberId',
        populate: {
          path: 'userId',
          select: 'name phone',
        },
      })
      .sort({ createdAt: -1 });

    const filteredServices = services.filter((service) => {
      if (!service.barberId) {
        return true;
      }

      return (
        service.barberId.isActive !== false &&
        service.barberId.isApproved === true &&
        (service.barberId.listingStatus === 'approved' || service.barberId.listingStatus === undefined)
      );
    });

    res.json({
      success: true,
      count: filteredServices.length,
      services: filteredServices,
    });
  } catch (error) {
    next(error);
  }
};

// Get service by ID
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'barberId',
      populate: {
        path: 'userId',
        select: 'name phone',
      },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// Create service
export const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, category } = req.body;
    let barberId = req.body.barberId || null;

    if (req.user.role === 'barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (!barber) {
        throw new AppError('Barber profile not found', 404);
      }
      barberId = barber._id;
    }

    const service = new Service({
      barberId,
      name,
      description,
      price,
      duration,
      category,
    });

    await service.save();
    await service.populate({
      path: 'barberId',
      populate: {
        path: 'userId',
        select: 'name phone',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// Update service
export const updateService = async (req, res, next) => {
  try {
    const { name, description, price, duration, category, isActive } = req.body;
    const existingService = await Service.findById(req.params.id);

    if (!existingService) {
      throw new AppError('Service not found', 404);
    }

    if (req.user.role === 'barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (!barber || String(existingService.barberId) !== String(barber._id)) {
        throw new AppError('You can only update your own services', 403);
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, duration, category, isActive },
      { new: true, runValidators: true }
    ).populate({
      path: 'barberId',
      populate: {
        path: 'userId',
        select: 'name phone',
      },
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const existingService = await Service.findById(req.params.id);

    if (!existingService) {
      throw new AppError('Service not found', 404);
    }

    if (req.user.role === 'barber') {
      const barber = await Barber.findOne({ userId: req.user.userId });
      if (!barber || String(existingService.barberId) !== String(barber._id)) {
        throw new AppError('You can only delete your own services', 403);
      }
    }

    await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyServices = async (req, res, next) => {
  try {
    const barber = await Barber.findOne({ userId: req.user.userId });
    if (!barber) {
      throw new AppError('Barber profile not found', 404);
    }

    const services = await Service.find({ barberId: barber._id, isActive: true }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};
