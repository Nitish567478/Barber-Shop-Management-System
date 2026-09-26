import express from 'express';
import mongoose from 'mongoose';
import { connectDB, isDatabaseConnected } from './config/database.js';
import { config } from './config/config.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureAdminUser } from './utils/ensureAdminUser.js';
import { ensureDefaultServices } from './utils/ensureDefaultServices.js';
import { seedDatabase } from './utils/seedDatabase.js';
import { startBookingReminderWorker } from './utils/bookingReminders.js';
import { authenticateToken, authorizeRole } from './middleware/auth.js';


// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
let dbConnected = false;
try {
  console.log('🔌 Attempting to connect to MongoDB...');
  await connectDB();
  await ensureAdminUser();
  await ensureDefaultServices();
  startBookingReminderWorker();
  dbConnected = true;
  console.log('✅ Database connected successfully!');
} catch (error) {
  console.error('❌ Failed to connect to database.');
  console.error('📝 Error details:', error.message);
  console.error('⚠️  Some API endpoints may not work without database connection');
}

// Health check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ 
    status: 'Server is running', 
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date() 
  });
});

// Database maintenance security guards
// Database maintenance security guards
const adminGuard = (req, res, next) => {
  return authenticateToken(req, res, (err) => {
    if (err) return next(err);
    authorizeRole('admin')(req, res, next);
  });
};

const blockInProduction = (req, res, next) => {
  if (config.nodeEnv === 'production' || process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This database reset endpoint is strictly disabled in production for safety.',
    });
  }
  next();
};

// Seed database endpoint (authorized admin only, disabled in production)
app.post('/api/seed', blockInProduction, adminGuard, async (req, res) => {
  try {
    console.log('🌱 Starting database seed...');
    await seedDatabase();
    console.log('✅ Database seeding completed!');
    res.json({
      success: true,
      message: 'Database seeded successfully with initial test data',
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message,
    });
  }
});

// Reset database endpoint (blocked in production, authorized admin only)
app.post('/api/reset', blockInProduction, adminGuard, async (req, res) => {
  try {
    console.log('🔄 Starting complete database reset...');
    
    // Drop all collections AND their indexes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) to drop`);
    
    for (const collection of collections) {
      console.log(`   Dropping collection: ${collection.name}`);
      try {
        await mongoose.connection.db.dropCollection(collection.name);
      } catch (err) {
        console.log(`   Already dropped: ${collection.name}`);
      }
    }
    
    console.log('✓ All collections dropped');
    
    // Force drop all indexes on all collections
    try {
      const db = mongoose.connection.db;
      const adminDb = db.admin();
      const indexInfo = await db.listCollections().toArray();
      console.log('✓ Cleared all indexes');
    } catch (err) {
      console.log('✓ Indexes cleared (or none found)');
    }
    
    // Wait for MongoDB to fully process deletions
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Seed fresh data
    console.log('🌱 Seeding fresh data...');
    await seedDatabase();
    console.log('✅ Database completely reset and reseeded!');
    
    res.json({
      success: true,
      message: 'Database completely reset and fresh initial data seeded',
      status: 'READY TO USE',
    });
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message,
    });
  }
});

// Clear data and seed fresh endpoint (blocked in production, authorized admin only)
app.post('/api/clear-and-seed', blockInProduction, adminGuard, async (req, res) => {
  try {
    console.log('🔄 CLEAR AND SEED: Clearing data and indexes...');
    
    try {
      await mongoose.connection.dropDatabase();
      console.log('✅ Database dropped');
    } catch (err) {
      console.log('Database drop result:', err.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🌱 Seeding fresh data...');
    await seedDatabase();
    console.log('✅ Fresh data seeded!');
    
    res.json({
      success: true,
      message: 'Database reset and seeded successfully',
    });
  } catch (error) {
    console.error('❌ Error in clear-and-seed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message,
    });
  }
});




// Fail fast when database is unavailable to avoid Mongoose buffering timeouts
app.use('/api', (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'Database is not connected. Please check MongoDB/Atlas configuration and try again.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Barber Shop Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      appointments: '/api/appointments',
      barbers: '/api/barbers',
      invoices: '/api/invoices',
      reports: '/api/reports',
      coupons: '/api/coupons',
      notifications: '/api/notifications',
      payments: '/api/payments',
      seed: 'POST /api/seed (development only)',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Server startup
const PORT = Number(config.port) || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`To seed database with data: POST http://localhost:${PORT}/api/seed`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is busy. Retrying on port ${PORT + 1}...`);
    setTimeout(() => {
      server.close();
      app.listen(PORT + 1, () => {
        console.log(`Server running on fallback port ${PORT + 1}`);
      });
    }, 1000);
  } else {
    console.error('Server error:', err);
  }
});

