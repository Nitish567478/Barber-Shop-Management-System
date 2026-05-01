import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, isDatabaseConnected } from './config/database.js';
import { config } from './config/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureAdminUser } from './utils/ensureAdminUser.js';
import { ensureDefaultServices } from './utils/ensureDefaultServices.js';
import { seedDatabase } from './utils/seedDatabase.js';
import { startBookingReminderWorker } from './utils/bookingReminders.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import couponRoutes from './routes/couponRoutes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://barber-shop-management-system-clien.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbConnected = false;

try {
  console.log('🔌 Connecting to MongoDB...');
  await connectDB();

  await ensureAdminUser();
  await ensureDefaultServices();

  startBookingReminderWorker();

  dbConnected = true;
  console.log('✅ Database connected');
} catch (error) {
  console.error('❌ DB connection failed:', error.message);
}

app.get('/health', (req, res) => {
  res.json({
    status: 'Server running',
    database: dbConnected ? 'connected' : 'disconnected',
    time: new Date()
  });
});

app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api', (req, res, next) => {
  if (isDatabaseConnected()) return next();

  return res.status(503).json({
    success: false,
    message: 'Database not connected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/coupons', couponRoutes);


app.get('/', (req, res) => {
  res.json({
    message: 'Barber Shop API',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});