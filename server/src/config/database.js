import mongoose from 'mongoose';
import { config } from './config.js';

mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Ensure MongoDB is running or Atlas network access is configured');
    throw error;
  }
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection failed:', error.message);
  }
};
