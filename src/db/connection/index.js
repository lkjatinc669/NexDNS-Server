import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Connects to the MongoDB database using Mongoose.
 * Defaults to local database if no URI is provided in env.
 */
export default async function connectToDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dns_server';

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,      // Parse MongoDB connection string properly
      useUnifiedTopology: true,   // Use the new connection management engine
    });

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Ensure startup fails on DB error
  }
}
