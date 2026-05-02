import mongoose from "mongoose";

const globalWithMongoose = global as typeof global & { _mongoConn?: Promise<typeof mongoose> };

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");

  if (mongoose.connection.readyState >= 1) return mongoose;

  if (!globalWithMongoose._mongoConn) {
    globalWithMongoose._mongoConn = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    }).catch((err) => {
      globalWithMongoose._mongoConn = undefined;
      throw err;
    });
  }
  return globalWithMongoose._mongoConn;
}
