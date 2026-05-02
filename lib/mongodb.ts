import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in .env.local");

// Cache connection across hot reloads in dev
const globalWithMongoose = global as typeof global & { _mongooseCache?: typeof mongoose };

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return mongoose;
  if (globalWithMongoose._mongooseCache) return globalWithMongoose._mongooseCache;
  globalWithMongoose._mongooseCache = await mongoose.connect(MONGODB_URI);
  return globalWithMongoose._mongooseCache;
}

export default connectDB;
