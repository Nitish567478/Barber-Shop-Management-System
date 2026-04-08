import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
  try {
    if (!mongoose.connection.db) {
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Ensure MongoDB is running: mongod');
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection failed:', error.message);
  }
};
