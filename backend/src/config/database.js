import mongoose from "mongoose";
import { seedPolicies } from "../../seed.js";

export async function connectDB() {
  mongoose.set("bufferCommands", false);
  const uri = process.env.MONGODB_URI;

  // If a real external MongoDB URI is provided, try connecting
  if (uri && !uri.includes("127.0.0.1") && !uri.includes("localhost")) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log("✅ MongoDB connected →", uri);
      await seedPolicies(false);
      return;
    } catch (err) {
      console.warn("⚠️ Could not connect to remote MongoDB:", err.message);
    }
  }

  // Use fast in-memory MongoDB
  console.log("🔄 Starting in-memory MongoDB...");
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();

    await mongoose.connect(memUri);
    console.log("✅ In-memory MongoDB connected →", memUri);
    await seedPolicies(false);
  } catch (memErr) {
    console.warn("⚠️ MongoDB offline or failed to start memory server:", memErr.message);
  }
}

