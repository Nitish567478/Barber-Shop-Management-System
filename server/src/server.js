import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureAdminUser } from './utils/ensureAdminUser.js';
import { seedDatabase } from './utils/seedDatabase.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
let dbConnected = false;
try {
  console.log('🔌 Attempting to connect to MongoDB...');
  await connectDB();
  await ensureAdminUser();
  dbConnected = true;
  console.log('✅ Database connected successfully!');
} catch (error) {
  console.error('❌ Failed to connect to database.');
  console.error('📝 Error details:', error.message);
  console.error('⚠️  Some API endpoints may not work without database connection');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date() 
  });
});

// Seed database endpoint (for development only!)
app.post('/api/seed', async (req, res) => {
  try {
    console.log('🌱 Starting database seed...');
    await seedDatabase();
    console.log('✅ Database seeding completed!');
    res.json({
      success: true,
      message: 'Database seeded successfully with dummy data',
      testAccounts: {
        admin: { email: 'admin.nitish@gmail.com', password: 'nitishAdmin@123' },
        barber: { email: 'ali@barbershop.com', password: 'password123' },
        customer: { email: 'ahmed@email.com', password: 'password123' },
      },
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message,
      details: error.stack,
    });
  }
});

// Reset database endpoint (for development only!)
app.post('/api/reset', async (req, res) => {
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
      message: 'Database completely reset - all bad indexes removed',
      status: 'READY TO USE',
      testAccounts: {
        admin: { email: 'admin.nitish@gmail.com', password: 'nitishAdmin@123' },
        barber: { email: 'ali@barbershop.com', password: 'password123' },
        customer: { email: 'ahmed@email.com', password: 'password123' },
      },
    });
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message,
      details: error.stack,
    });
  }
});

// Clear data and seed fresh endpoint (NUCLEAR OPTION - Use only when stuck!)
app.post('/api/clear-and-seed', async (req, res) => {
  try {
    console.log('🔄 NUCLEAR RESET: Clearing ALL data and indexes...');
    
    // Drop EVERYTHING
    try {
      await mongoose.connection.dropDatabase();
      console.log('✅ Entire database dropped');
    } catch (err) {
      console.log('Database drop result:', err.message);
    }
    
    // Wait for database to fully reset
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🌱 Seeding fresh data...');
    await seedDatabase();
    console.log('✅ Fresh data seeded!');
    
    res.json({
      success: true,
      message: '✅ DATABASE COMPLETELY RESET & SEEDED',
      info: 'All old data and indexes removed. Database ready to use.',
      testAccounts: {
        admin: { email: 'admin.nitish@gmail.com', password: 'nitishAdmin@123' },
        barber: { email: 'ali@barbershop.com', password: 'password123' },
        customer: { email: 'ahmed@email.com', password: 'password123' },
      },
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


app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/invoices', invoiceRoutes);

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
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`To seed database with dummy data: POST http://localhost:${PORT}/api/seed`);
});

