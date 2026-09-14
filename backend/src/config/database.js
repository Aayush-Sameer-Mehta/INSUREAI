import mongoose from "mongoose";
import dns from "dns";
import { seedPolicies } from "../../seed.js";

function maskMongoUri(uri = "") {
  if (!uri) return "";
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

export async function connectDB() {
  mongoose.set("bufferCommands", false);
  const uri = process.env.MONGODB_URI?.trim();

  // If a MongoDB URI is configured (Atlas or local), attempt connection
  if (uri) {
    try {
      if (uri.startsWith("mongodb+srv://")) {
        try {
          dns.setServers(["8.8.8.8", "1.1.1.1"]);
        } catch {
          // ignore if environment restricts
        }
      }
      console.log(`🔄 Connecting to MongoDB (${maskMongoUri(uri)})...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
      });
      console.log("✅ MongoDB connected →", maskMongoUri(uri));
      await seedPolicies(false);
      return;
    } catch (err) {
      console.warn("⚠️ Could not connect to configured MongoDB:", err.message);
      console.warn("ℹ️ Falling back to in-memory MongoDB for local development...");
    }
  }

  // Fallback to fast in-memory MongoDB if configured URI failed or not provided
  console.log("🔄 Starting in-memory MongoDB...");
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();

    await mongoose.connect(memUri);
    console.log("✅ In-memory MongoDB connected →", memUri);
    await seedPolicies(false);
  } catch (memErr) {
    console.error("❌ MongoDB offline or failed to start memory server:", memErr.message);
  }
}

